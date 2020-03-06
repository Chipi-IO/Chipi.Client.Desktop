import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ipcRenderer, shell } from "electron";
import initializePlugins from "../lib/initializePlugins";
import { on, send } from "../lib/rpc";
import {
  authStateChanged,
  tokensChanged,
  startAuthenticating,
  online,
  offline
} from "./actions/auth";
import { connectsLoaded } from "@app/main/store/connect/actions";
import { connectAppAuthCodeReceived } from "./actions/connector";
import { sendFeedback } from "../lib/chipi/feedback";
import { chipiUserData } from "@app/lib/chipi";
import config from "../lib/config";
import store, { history } from "./store";
import "./css/global.css";
import { CHIPI_WEB_CLIENT } from "Environment";
import Logger from "../lib/logger";
import "../lib/newRelic";
import { AppContainer } from "react-hot-loader";
import Routes from "./routes";

const logger = new Logger("app/main");

require("fix-path")();

global.React = React;
global.ReactDOM = ReactDOM;
global.isBackground = false;

/**
 * Change current theme
 *
 * @param  {String} src Absolute path to new theme css file
 */
const changeTheme = src => {
  document.getElementById("chipi-theme").href = src;
};

const initializeApplication = () => {
  logger.verbose("[initializeApplication] Triggered");

  // Initialize plugins, can be done at rendering porcess
  initializePlugins();

  // Initialize background tasks
  send("initializeBackgroundTasks");
};

// Set theme from config
changeTheme(config.get("theme"));

const rootContainer = document.getElementById("root");

ReactDOM.render(
  <AppContainer>
    <Provider store={store}>
      <Routes history={history} /> {/* pass history object as props */}
    </Provider>
  </AppContainer>,
  rootContainer
);

rootContainer.classList.add(process.platform);

//Once the dom rendered, we can initialize applicaiton
initializeApplication();

on(
  "update-downloaded",
  () =>
    new Notification("CHIPI - Update ready to install", {
      body: "Restart CHIPI to automatically install the latest version!"
    })
);

// Handle `updateTheme` rpc event and change current theme
on("updateTheme", changeTheme);

// Handle `reload` rpc event and reload window
on("reload", () => location.reload());

// Auth state changed
on("authStateChanged", ({ authState }) => {
  logger.verbose("[app/main authStateChanged] Triggered", authState);
  store.dispatch(authStateChanged(authState));
});

on("sendFeedback", data => {
  sendFeedback({
    ...data,
    authToken: store.getState().authState.idToken
  });
});

// Tokens token changed
on("tokensChanged", ({ tokens }) => {
  logger.verbose("[app/main tokensChanged] Triggered", tokens);
  store.dispatch(tokensChanged(tokens));
});

// When authenticating happening, some side effects will happen
on("onAuthenticating", () => {
  logger.verbose("[app/main onAuthenticating] Triggered");
  store.dispatch(startAuthenticating());
});

on("backgroundTasksReady", () => {
  logger.verbose("[app/main backgroundTasksReady] Triggered");
  //Tell the main process that the application is ready
  ipcRenderer.send("applicationReady");
});

//payload: { authCode, applicationId }
on("connectAppAuthCodeReceived", payload => {
  logger.debug("[connectAppAuthCodeReceived] triggered", payload);

  store.dispatch(connectAppAuthCodeReceived(payload));
});

on("viewAppConnections", payload => {
  //console.log('TODO: Send user to connected apps URL')
  const webClientUrl = `${CHIPI_WEB_CLIENT.host}#connections`;
  shell.openExternal(webClientUrl);
});

on("cacheRefreshed", async () => {
  const connects = await chipiUserData.instance.listConnects();
  store.dispatch(connectsLoaded(connects));
});

function updateOnlineStatus() {
  if (online()) {
    // If application back online, send notification to background window
    send("online");
  }

  store.dispatch(window.navigator.onLine ? online() : offline());
}

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
