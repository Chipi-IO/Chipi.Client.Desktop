import { app, remote } from "electron";

export const USER_DATA = (app || remote.app).getPath("userData");

export const isDev = () => true;

export const CHECK_UPDATES = false;

const AWS_COGNITO_HOST = "https://identity.chipi-uat.io";
export const CHIPI_PROTOCOL = "chipi-dev";

export const AWS_COGNITO = {
  host: AWS_COGNITO_HOST,
  userPoolWebClientId: "2utbm0hqtl81tgt0ac2opsp2a3",
  authorizationUrl: AWS_COGNITO_HOST + "/oauth2/authorize",
  tokenUrl: AWS_COGNITO_HOST + "/oauth2/token",
  redirectUrl: "https://desktop.chipi-uat.io/oauth2callback",
  redirectUrlWebFlow: "https://web.chipi-uat.io/"
};

export const GOOGLE_AUTH = {
  authPath: "https://accounts.google.com/o/oauth2/v2/auth"
};

export const LOG_CONFIG = {
  level: "verbose"
};

export const AUTH_TOKEN_STORAGE = {
  serviceName: "io.chipi.client.desktop.uat",
  secureStoreUserName: "ChipiCognitoUser",
  sessionPartitionName: "chipiAuthSession",
  refreshTokenCookieName: "refreshToken",
  accessTokenCookieName: "accessToken"
};

export const CHIPI_WEB_CLIENT = {
  host: "https://web.chipi-uat.io",
  authorizationHashPage: "authorization",
  externalRedirect: `${CHIPI_PROTOCOL}://authreturn`, // Tells web client where the external redirect should redirect after receiving authcode
  authRedirect: "https://web.chipi-uat.io/" // Web client always uses this value for Cognito oAuth flow, the desktop client also needs to use this value to retrieve the refresh token.
};

export const CHIPI_APIS = {
  searchApiHost: "https://api.chipi-uat.io/search",
  connectorApiHost: "https://api.chipi-uat.io/connector",
  indexingApiHost: "https://api.chipi-uat.io/indexing",
  helpApiHost: "https://mym1xjvrfg.execute-api.us-east-1.amazonaws.com/uat",
  resourceApiHost: "https://api.chipi-uat.io/resource"
};

export const CHIPI_ANALYTICS = {
  analyticsEventsApiHost: "https://tshewpjhdi.execute-api.us-east-1.amazonaws.com/uat",
  deliveryStreamName: "Chipi.Analytics.Events-uat"
};
