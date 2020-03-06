import React from "react";
import ReactDOM from "react-dom";
import plugins from "plugins";
import { on, send } from "lib/rpc";
import { settings as pluginSettings, modulesDirectory } from "lib/plugins";
import { chipiUserData } from "@app/lib/chipi";

require("fix-path")();

import Logger from "../lib/logger";

import { chipiAuth } from "../lib/chipi";

const logger = new Logger("app/background");

let _userDataCacheRefreshTask;
const _cacheRefreshInterval = 300000; // 5 minutes

global.React = React;
global.ReactDOM = ReactDOM;
global.isBackground = true;

on("initializePluginAsync", ({ name }) => {
  console.group(`Initialize async plugin ${name}`);
  try {
    const { initializeAsync } = plugins[name]
      ? plugins[name]
      : window.require(`${modulesDirectory}/${name}`);
    if (!initializeAsync) {
      console.log("no `initializeAsync` function, skipped");
      return;
    }
    console.log("running `initializeAsync`");
    initializeAsync(data => {
      console.log("Done! Sending data back to main window");
      // Send message back to main window with initialization result
      send("plugin.message", {
        name,
        data
      });
    }, pluginSettings.getUserSettings(name));
  } catch (err) {
    console.log("Failed", err);
  }
  console.groupEnd();
});

// Handle `reload` rpc event and reload window
on("reload", () => location.reload());

on("authCodeReceived", authCode => {
  logger.info("[authCodeReceived] Triggered", authCode);
  send("onAuthenticating", {});
  chipiAuth.loadAuthStateByAuthCode(authCode);
});

on("signOut", () => {
  logger.info("[signOut] Triggered");
  chipiAuth.signOut();
});

on("initializeBackgroundTasks", () => {
  logger.info("[initializeBackgroundTasks] Initialize background tasks triggered");

  initializeAuthentication().then(() => {
    logger.debug("[initializeBackgroundTasks] All background tasks promise finished");

    send("backgroundTasksReady");
  });
});

on("online", () => {
  initializeAuthentication();
});

function initializeAuthentication() {
  send("onAuthenticating", {});
  return chipiAuth.createRefreshTokensTask(Date.now(), null, true);
}

async function refreshCacheData() {
  await chipiUserData.instance.refreshCache();
  send("cacheRefreshed");
}

on("signedIn", () => {
  logger.verbose("Background signedIn triggered");
  refreshCacheData();

  if (!_userDataCacheRefreshTask) {
    // Initiate the interval task to refresh user person cache
    _userDataCacheRefreshTask = setInterval(function() {
      if (window.navigator.onLine) {
        refreshCacheData();
      }
    }, _cacheRefreshInterval);
  }
});

on("signedOut", () => {
  logger.verbose("Background signedOut triggered");

  chipiUserData.instance && chipiUserData.instance.dispose();

  if (_userDataCacheRefreshTask) {
    clearInterval(_userDataCacheRefreshTask);
    _userDataCacheRefreshTask = null;
  }
});
