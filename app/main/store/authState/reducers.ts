import {
  AUTH_STATE_CHANGED,
  START_AUTHENTICATING,
  ONLINE,
  OFFLINE
} from "@app/main/constants/actionTypes";
import { send } from "@app/lib/rpc";
import Logger from "@app/lib/logger";
import { IAuthState, IAuthStateActionTypes } from "./types";
import { chipiUserData } from "@app/lib/chipi";

const logger = new Logger("authReducer");
//Available authState: signIn, signUp, confirmSignIn, confirmSignUp, forgotPassword, verifyContact, signedIn

const initialState: IAuthState = {
  isAuthenticated: false,
  user: {},
  userName: undefined,
  accessToken: null,
  idToken: null,
  isAuthenticating: false,
  isOffline: !window.navigator.onLine
};

export function authStateReducer(state = initialState, action: IAuthStateActionTypes): IAuthState {
  switch (action.type) {
    case AUTH_STATE_CHANGED: {
      logger.verbose("[reducers.authState] AUTH_STATE_CHANGED called", {
        isAuthenticated: action.payload.authState.isAuthenticated
      });

      const { isAuthenticated, user, userName, accessToken, idToken } = action.payload.authState;

      if (isAuthenticated) {
        // Send signal to background window for user data cache rereshing
        send("signedIn");
      } else {
        chipiUserData.instance && chipiUserData.instance.dispose();
        send("signedOut");
      }

      return {
        ...initialState,
        isAuthenticated,
        user,
        userName,
        accessToken,
        idToken,
        isAuthenticating: false,
        isOffline: false
      };
    }
    case START_AUTHENTICATING: {
      return {
        ...initialState,
        isAuthenticating: true
      };
    }
    case ONLINE: {
      return {
        ...state,
        isOffline: false
      };
    }
    case OFFLINE: {
      return {
        ...state,
        isOffline: true
      };
    }
    default:
      return state;
  }
}
