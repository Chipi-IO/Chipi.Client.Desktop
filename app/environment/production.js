import { app, remote } from "electron";

export const USER_DATA = (app || remote.app).getPath("userData");

export const isDev = () => false;

export const CHECK_UPDATES = true;

const AWS_COGNITO_HOST = "https://identity.chipi.io";
export const CHIPI_PROTOCOL = "chipi";

export const AWS_COGNITO = {
  host: AWS_COGNITO_HOST,
  userPoolWebClientId: "17iii0diih1sb1vq223ngmeavc",
  authorizationUrl: AWS_COGNITO_HOST + "/oauth2/authorize",
  tokenUrl: AWS_COGNITO_HOST + "/oauth2/token",
  redirectUrl: "https://desktop.chipi.io/oauth2callback",
  redirectUrlWebFlow: "https://web.chipi.io/"
};

export const GOOGLE_AUTH = {
  authPath: "https://accounts.google.com/o/oauth2/v2/auth"
};

export const LOG_CONFIG = {
  level: "warn"
};

export const AUTH_TOKEN_STORAGE = {
  serviceName: "io.chipi.client.desktop",
  secureStoreUserName: "ChipiCognitoUser",
  sessionPartitionName: "chipiAuthSession",
  refreshTokenCookieName: "refreshToken",
  accessTokenCookieName: "accessToken"
};

export const CHIPI_WEB_CLIENT = {
  host: "https://web.chipi.io",
  authorizationHashPage: "authorization",
  externalRedirect: "chipi://authreturn", // Tells web client where the external redirect should redirect after receiving authcode
  authRedirect: "https://web.chipi.io/" // Web client always uses this value for Cognito oAuth flow, the desktop client also needs to use this value to retrieve the refresh token.
};

export const CHIPI_APIS = {
  searchApiHost: "https://api.chipi.io/search",
  connectorApiHost: "https://api.chipi.io/connector",
  indexingApiHost: "https://api.chipi.io/indexing",
  helpApiHost: "https://67sxg3h863.execute-api.ap-southeast-2.amazonaws.com/prod",
  resourceApiHost: "https://api.chipi.io/resource"
};

export const CHIPI_ANALYTICS = {
  analyticsEventsApiHost: "https://5m4bxvja30.execute-api.ap-southeast-2.amazonaws.com/prod",
  deliveryStreamName: "Chipi.Analytics.Events-prod"
};
