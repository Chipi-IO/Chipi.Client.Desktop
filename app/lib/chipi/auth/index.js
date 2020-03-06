import {
  AWS_COGNITO,
  SERVICE_NAME,
  isDev,
  AUTH_TOKEN_STORAGE,
  CHIPI_WEB_CLIENT
} from "Environment";
import qs from "querystring";
import Logger from "../../logger";
import authUtil from "./authUtil";
import jwt_decode from "jwt-decode";
import chipiRequest from "../request";
import { on, send } from "../../rpc";
import { SecurityError, NetworkError } from "../../errors";

const logger = new Logger("lib.chipi.auth");
let tokenRefreshTask;
let signingOut = false;
const authStateLocalStoreName = "AUTH_STATE";

const defaultAuthRequestRaxConfig = {
  httpMethodsToRetry: ["POST", "GET", "HEAD", "OPTIONS", "DELETE", "PUT"],
  retry: 10,
  noResponseRetries: 100,
  retryDelay: 5000
};

class ChipiAuth {
  constructor() {
    this.createRefreshTokensTask = this.createRefreshTokensTask.bind(this);
    this.createAuthStateByTokens = this.createAuthStateByTokens.bind(this);
    this.loadAuthStateByAuthCode = this.loadAuthStateByAuthCode.bind(this);
    this.loadAuthStateByRefreshToken = this.loadAuthStateByRefreshToken.bind(this);
    this.fetchTokensByAuthCode = this.fetchTokensByAuthCode.bind(this);
    this.fetchTokensByRefreshToken = this.fetchTokensByRefreshToken.bind(this);
    this.readSavedRefreshToken = this.readSavedRefreshToken.bind(this);
    this.saveRefreshToken = this.saveRefreshToken.bind(this);
    this.deleteSavedRefreshToken = this.deleteSavedRefreshToken.bind(this);
    this.handleAuthStateChanged = this.handleAuthStateChanged.bind(this);
    this.handleTokensChanged = this.handleTokensChanged.bind(this);
    this.createRefreshTokensTask = this.createRefreshTokensTask.bind(this);
    this.getAuthState = this.getAuthState.bind(this);
    this.setCurrentAuthState = this.setCurrentAuthState.bind(this);
  }

  setCurrentAuthState(authState) {
    localStorage.setItem(authStateLocalStoreName, JSON.stringify(authState));
  }

  getAuthState() {
    const savedAuthState = localStorage.getItem(authStateLocalStoreName);
    return JSON.parse(savedAuthState);
  }

  signOut() {
    signingOut = true;
    var unauthenticatedAuthState = {
      isAuthenticated: false,
      isAuthenticating: false
    };
    this.handleAuthStateChanged(unauthenticatedAuthState);
    this.handleTokensChanged(null);

    tokenRefreshTask = null;

    this.deleteSavedRefreshToken();
    localStorage.removeItem(authStateLocalStoreName);
    signingOut = false;
  }

  /**
   * Send load user by tokens
   * @param   authCode the autorization code return from AWS Cognito
   */
  async loadAuthStateByAuthCode(authCode) {
    logger.verbose("[loadAuthStateByAuthCode] Called", { authCode });

    if (!authCode) {
      logger.error("[loadAuthStateByAuthCode] Failed to load auth state. authCode is null");

      this.signOut();
      throw new SecurityError("Failed to load auth state", "Parameter authCode is null");
    }

    try {
      logger.verbose("[LoadAuthStateByAuthCode] Start getting tokens");

      let tokens = await this.fetchTokensByAuthCode(authCode);

      logger.verbose("[LoadAuthStateByAuthCode] Tokens returned", tokens);

      this.createAuthStateByTokens(tokens);
    } catch (err) {
      //TODO: Deal with error
      logger.debug("[loadAuthStateByAuthCode] Failed to fetch tokens. ", {
        err
      });
      logger.error("[loadAuthStateByAuthCode] Failed to fetch tokens.", err.message);

      this.signOut();
      throw new SecurityError("Failed to load auth state", err);
    }
  }

  /**
   * Load Chipi AuthState by refresh token
   * @param {string} refreshToken
   */
  async loadAuthStateByRefreshToken(refreshToken) {
    logger.verbose("[loadAuthStateByRefreshToken] Called", { refreshToken });

    if (!refreshToken) {
      logger.error("[loadAuthStateByRefreshToken] Failed to load auth state. refreshToken is null");

      this.signOut();

      throw new SecurityError("Failed to load auth state", "Parameter refreshToken is null");
    }

    try {
      logger.verbose("[loadAuthStateByRefreshToken] Start getting tokens");

      var tokens = await this.fetchTokensByRefreshToken(refreshToken);

      logger.verbose("[loadAuthStateByRefreshToken] Tokens returned", tokens);

      this.createAuthStateByTokens(tokens);
    } catch (err) {
      if (err instanceof NetworkError || err.message === "Network error") {
        logger.warn("[loadAuthStateByRefreshToken] Network error to fetch tokens.", { err });

        // If the error is the network error, we don't sign out
        return;
      }

      //TODO: Deal with error
      logger.debug("[loadAuthStateByRefreshToken] Failed to fetch tokens. ", {
        err
      });
      logger.error("[loadAuthStateByRefreshToken] Failed to fetch tokens.", err.message);

      this.signOut();
      throw new SecurityError("Failed to load auth state", err);
    }
  }

  /**
   * Create Chipi AuthState by Cognito tokens
   * @param {string} tokens
   */
  async createAuthStateByTokens(tokens) {
    if (!tokens) {
      //Set AuthState to unauthenticated
      logger.error("[createAuthStateByTokens] Tokens passed in is null");

      throw new SecurityError("Failed to load auth state", "Parameter tokens is null");
    } else {
      try {
        let decodedIdToken = jwt_decode(tokens.id_token);
        logger.verbose("[loadAuthStateByTokens] Decoded id_token", {
          decodedIdToken
        });

        //TODO: verify tokens
        var authState = {
          isAuthenticated: true,
          userName: decodedIdToken["cognito:username"],
          user: {
            name: decodedIdToken.name,
            givenName: decodedIdToken.given_name || decodedIdToken.name,
            email: decodedIdToken.email,
            picture: decodedIdToken.picture
          },
          accessToken: tokens.access_token,
          idToken: tokens.id_token,
          isAuthenticating: false
        };
      } catch (err) {
        logger.error("[loadAuthStateByTokens] Failed to generate auth state from provided tokens", {
          err
        });
        logger.debug("[loadAuthStateByTokens] Failed to generate auth state from provided tokens", {
          tokens
        });

        throw new SecurityError("Failed to ceate auth state by tokens", err);
      }
    }

    this.handleAuthStateChanged(authState);
    this.handleTokensChanged(tokens);
  }

  /**
   * Send load user by tokens
   * @param   {string} authCode the autorization code return from AWS Cognito
   * @returns tokens AWS Cognito Tokens .
   * @returns tokens.access_token access_token of the current user.
   * @returns tokens.id_token Open Id identity token of the current user.
   * @returns tokens.refresh_token refresh token for refresh the access token once expired.
   * @returns tokens.expires_in  seconds of the access_token will be expired
   * @returns tokens.token_type  the type of the access_token
   */
  async fetchTokensByAuthCode(authCode) {
    logger.verbose("[fetchTokensByAuthCode] Called", { authCode });
    if (!authCode) {
      logger.error("[fetchTokensByAuthCode] authCode is null");
      throw new SecurityError("Failed to fetch tokens by auth code", "Parameter authCode is null");
    }

    let tokenRequestData = {
      grant_type: "authorization_code",
      client_id: AWS_COGNITO.userPoolWebClientId,
      code: authCode,
      redirect_uri: CHIPI_WEB_CLIENT.authRedirect
    };

    logger.verbose("[fetchTokensByAuthCode] Token request data generated", {
      tokenRequestData
    });

    logger.verbose("[fetchTokensByAuthCode] Sending token request to server");

    const fetchTokenRequestOptions = {
      raxConfig: defaultAuthRequestRaxConfig,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      url: AWS_COGNITO.tokenUrl,
      data: qs.stringify(tokenRequestData)
    };

    return chipiRequest
      .post(fetchTokenRequestOptions)
      .catch(err => {
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          logger.error("[fetchTokensByAuthCode] Token response has error", err.response);
        } else if (err.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          logger.error("[fetchTokensByAuthCode] Token request has error", err.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          logger.error("[fetchTokensByAuthCode] Setting up request went wrong", err.message);
        }
        logger.debug("[fetchTokensByAuthCode] Error debug data", err);
        logger.info("[fetchTokensByAuthCode] Error config data", err.config);

        throw new SecurityError("System was unable to retrieve tokens", err);
      })
      .then(res => {
        logger.verbose("[fetchTokensByAuthCode] Token request succeed.", res);
        return res;
      });
  }

  /**
   * Fetch new tokens from cognito with the refresh token
   * @param {string} refreshToken
   * @returns tokens AWS Cognito Tokens .
   * @returns tokens.access_token access_token of the current user.
   * @returns tokens.id_token Open Id identity token of the current user.
   * @returns tokens.refresh_token refresh token for refresh the access token once expired.
   * @returns tokens.expires_in  seconds of the access_token will be expired
   * @returns tokens.token_type  the type of the access_token
   */
  async fetchTokensByRefreshToken(refreshToken) {
    logger.verbose("[fetchTokensByRefreshToken] Called", { refreshToken });
    if (!refreshToken) {
      logger.error("[fetchTokensByRefreshToken] refreshToken is null");
      throw new Security("Failed fetch tokens by refreshtoken", "Parameter refreshToken is null");
    }

    let tokenRequestData = {
      grant_type: "refresh_token",
      client_id: AWS_COGNITO.userPoolWebClientId,
      refresh_token: refreshToken
    };

    logger.verbose("[fetchTokensByRefreshToken] Token request data generated", {
      tokenRequestData
    });
    logger.verbose("[fetchTokensByRefreshToken] Sending token request to server");

    const fetchTokenRequestOptions = {
      raxConfig: defaultAuthRequestRaxConfig,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      url: AWS_COGNITO.tokenUrl,
      data: qs.stringify(tokenRequestData)
    };

    return chipiRequest
      .post(fetchTokenRequestOptions)
      .catch(err => {
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          logger.error("[fetchTokensByRefreshToken] Token response has error", err.response);
        } else if (err.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          logger.error("[fetchTokensByRefreshToken] Token request has error", err.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          logger.error("[fetchTokensByRefreshToken] Setting up request went wrong", err.message);
        }
        logger.debug("[fetchTokensByRefreshToken] Error debug data", err);
        logger.info("[fetchTokensByRefreshToken] Error config data", err.config);

        if (!err.response || err.message === "Network Error") {
          // If no response, we believe it's network issue. We
          throw new NetworkError("Network error", err);
        } else {
          throw new SecurityError("System was unable to retrieve tokens", err);
        }
      })
      .then(res => {
        logger.verbose("[fetchTokensByRefreshToken] Token request succeed.", res);

        //Since the /Token endpoint doesn't return new refresh token, we need to manually assign the value to old one
        res.refresh_token = refreshToken;
        return res;
      });
  }

  /**
   * Read the saved refresh token from system secured storage
   */
  async readSavedRefreshToken() {
    logger.debug("[readSavedRefreshToken] Reading refresh token");

    return authUtil
      .getSecureStore()
      .getPassword(AUTH_TOKEN_STORAGE.serviceName, AUTH_TOKEN_STORAGE.secureStoreUserName);
  }

  /**
   * Save refresh token into system secured storage
   * @param {string} refreshToken The token to be saved in the secured storage.
   */
  async saveRefreshToken(refreshToken) {
    logger.verbose("[saveResfreshToken] Trying to save refresh token into secured storage", {
      refreshToken
    });
    try {
      // At any time we only want to save one refresh token, so use the same user name
      return authUtil
        .getSecureStore()
        .setPassword(
          AUTH_TOKEN_STORAGE.serviceName,
          AUTH_TOKEN_STORAGE.secureStoreUserName,
          refreshToken
        );
    } catch (err) {
      logger.error("[saveResfreshToken] failed to save refresh token into secured storage.", err);
      throw new Error("Application not able to save user's refresh token to secured storage");
    }
  }

  /**
   * Delete user saved refresh token, for logout
   */
  async deleteSavedRefreshToken() {
    logger.verbose("[deleteSavedRefreshToken] Called", {});
    try {
      // At any time we only want to save one refresh token, so use the same user name
      return authUtil
        .getSecureStore()
        .deletePassword(AUTH_TOKEN_STORAGE.serviceName, AUTH_TOKEN_STORAGE.secureStoreUserName);
    } catch (err) {
      logger.warn(
        "[deleteSavedRefreshToken] failed to delete saved refresh token from secured storage.",
        err
      );
    }
  }

  async handleAuthStateChanged(authState) {
    logger.verbose("[handleAuthStateChanged] AuthState changed", { authState });
    // Whenever the auth state changed, we need to save it into the local storage for global sharing
    this.setCurrentAuthState(authState);

    //ipcMain.emit('authStateChanged', { authState });
    send("authStateChanged", { authState });
  }

  async handleTokensChanged(tokens) {
    if (!tokens) {
      logger.warn("[handleTokensChanged] Tokens passed in is null");
      //ipcMain.emit('accessTokenChanged', { accessToken: null })
      send("tokensChanged", { accessToken: null });

      return;
    }

    let inMemoryRefreshToken;

    this.saveRefreshToken(tokens.refresh_token)
      .catch(err => {
        logger.warn("[loadAuthStateByAuthCode] Saving refresh token has error", err);

        // In case, system cannot save the refresh token to secure storage. We will leave the
        // refresh token in memory for scheduled task to refresh it.

        //NOTE: DONOT THROW THE ERROR AGAIN, WE NEED THE AUTHSTATE TO BE CREATED REGARDLESS

        // Assign refresh token to in memory object, system knows it should use in memory refresh token
        // instead of from secured storage
        inMemoryRefreshToken = tokens.refresh_token;
      })
      .then(() => {
        //Raise access token changed event regardless if the refresh token saved or not.
        send("tokensChanged", {
          accessToken: tokens.access_token,
          idToken: tokens.id_token
        });

        var tokenExpiresAt = tokens.expires_in * 1000 + new Date().getTime();

        logger.info("[handleTokensChanged] Setting up a scheduled task to refresh tokens");
        logger.debug("[handleTokensChanged] Setting up a scheduled task to refresh tokens", {
          tokenExpiresAt,
          inMemoryRefreshToken
        });

        return this.createRefreshTokensTask(tokenExpiresAt, inMemoryRefreshToken);
      });
  }

  async createRefreshTokensTask(tokenExpiresAt, inMemoryRefreshToken, immediate = false) {
    //tokenExpiresAt = 650000 + (new Date()).getTime();
    var checkTokenInterval = 30000;
    //}

    if (immediate) {
      refreshTokens(tokenExpiresAt, inMemoryRefreshToken);
    }

    if (tokenRefreshTask) {
      clearInterval(tokenRefreshTask);
    }

    tokenRefreshTask = setInterval(function() {
      if (window.navigator.onLine) {
        //ipcMain.emit('refreshAccessToken', inMemoryRefreshToken)
        refreshTokens(tokenExpiresAt, inMemoryRefreshToken);
      }
    }, checkTokenInterval);

    return Promise.resolve();
  }
}

// TODO: move refresh token to redux store/dispatch pattern
const refreshTokens = (tokenExpiresAt, inMemoryRefreshToken) => {
  logger.debug("Check refresh token task triggered", {
    tokenExpiresAt,
    inMemoryRefreshToken
  });

  //Refresh token 10 mins before the expiring time && only try the token refresh when online
  if (window.navigator.onLine && new Date().getTime() + 600000 >= tokenExpiresAt) {
    logger.debug("[refreshAccessToke] refreshTokens triggered", {
      inMemoryRefreshToken
    });
    let chipiAuth = new ChipiAuth();
    //clearInterval(tokenRefreshTask);

    if (!inMemoryRefreshToken && !signingOut) {
      chipiAuthInstance.readSavedRefreshToken().then(savedRefreshToken => {
        if (!savedRefreshToken) {
          return chipiAuthInstance.signOut();
        }

        logger.info("[refreshAccessToken] Refresh token returned from storage");
        logger.verbose("[refreshAccessToken] Saved refresh token", {
          savedRefreshToken
        });

        return chipiAuthInstance.loadAuthStateByRefreshToken(savedRefreshToken);
      });
    } else {
      chipiAuthInstance.loadAuthStateByRefreshToken(inMemoryRefreshToken);
    }
  }
};

const chipiAuthInstance = new ChipiAuth();

export default {
  instance: chipiAuthInstance
};
