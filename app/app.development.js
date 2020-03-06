import { app, ipcMain, crashReporter, globalShortcut, protocol, shell } from "electron";
import fs from "fs";
import createMainWindow from "./main/createWindow";
import createBackgroundWindow from "./background/createWindow";
import createFeedbackWindow from "./main/windows/feedback/createWindow";
import config from "./lib/config";
import AppTray from "./main/createWindow/AppTray";
import initAutoUpdater from "./initAutoUpdater";
import { isDev, USER_DATA, CHIPI_WEB_CLIENT, AWS_COGNITO, CHIPI_PROTOCOL } from "Environment";
import Logger from "./lib/logger";
import toggleWindow from "./main/createWindow/toggleWindow";
import handleUrl from "./main/createWindow/handleUrl";
import qs from "querystring";
import autoStart from "./main/createWindow/autoStart";

// Ensure user data directory exists before we access it
// This prevents the race condition on app start for fresh installations
if (!fs.existsSync(USER_DATA)) {
  fs.mkdirSync(USER_DATA);
}

const logger = new Logger("mainProcess");
const trayIconSrc = (() => {
  switch (process.platform) {
    case "darwin":
      return `${__dirname}/resources/tray_iconTemplate@2x.png`;
    case "win32":
      return `${__dirname}/resources/tray_icon.ico`;
    default:
      return `${__dirname}/resources/tray_icon.png`;
  }
})();

//Remove the config file when app start for dev environment
if (isDev()) {
  //config.remove();
}

const firstPageSrc = `file://${__dirname}/main/index.html`;

require("electron-debug")({ showDevTools: false });

let mainWindow;
let backgroundWindow;
let feedbackWindow;
let helperWindow;
let tray;

const handleUrlFromArgv = argv => {
  logger.info("Make single instnace call back", { argv });
  // Check if the second instance was attempting to launch a URL for our protocol client
  const url = argv.find(function(arg) {
    const protocolRegex = new RegExp(`${CHIPI_PROTOCOL}:\/\/`);
    return protocolRegex.test(arg);
  });

  if (url) {
    app.emit("open-url", null, url);
  }
};

const gotSingleLock = app.requestSingleInstanceLock();

if (!gotSingleLock) {
  app.quit();
}

// To help some OS limitation, we need to set the app user mode id same to the appId in the build secion within package file.
app.setAppUserModelId("io.chipi.desktop");

app.on("second-instance", (event, argv, cwd) => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.focus();

    // Protocol handler for win32
    // argv: An array of the second instance’s (command line / deep linked) arguments
    if (process.platform == "win32") {
      handleUrlFromArgv(argv);
    }
  } else {
    logger.warn("Trying to run the second app instance, going to quit");
    app.quit();
  }
});

if (process.env.NODE_ENV !== "development") {
  // Set up crash reporter before creating windows in production builds
  if (config.get("crashReportingEnabled")) {
    crashReporter.start({
      productName: "Chipi",
      companyName: "Chipi",
      submitURL: "https://crashes.chipi.io/post",
      autoSubmit: true
    });
  }
}

const registerHotkey = () => {
  let hotkey = config.get("hotkey");
  if (!hotkey) {
    // TODO: allow user to set custom hotkey
    hotkey = "Control+Space";
    config.set("hotkey", hotkey);
  }

  globalShortcut.register(hotkey, () => {
    toggleWindow(mainWindow);
  });
};

const registerOpenAtLogin = () => {
  logger.verbose("Setting auto start while app begin", config.get("openAtLogin"));
  autoStart.set(config.get("openAtLogin"));
};

/**
 * Initate windows for the application
 */
const initiateWindows = () => {
  let mainWindowAppeared = false;

  // we need to recreate all the windows if the the windows were already created.

  if (mainWindow) {
    mainWindow.webContents.closeDevTools();
    mainWindow.destroy();
    mainWindowAppeared = true;
  }

  // Main window
  mainWindow = createMainWindow({
    isDev,
    // Main window html
    src: firstPageSrc
  });

  if (mainWindowAppeared) {
    mainWindow.show();
  }

  if (backgroundWindow) {
    backgroundWindow.webContents.closeDevTools();
    backgroundWindow.destroy();
  }

  // Background window
  backgroundWindow = createBackgroundWindow({
    src: `file://${__dirname}/background/index.html`
  });

  if (tray) {
    tray.destroy();
  }

  tray = new AppTray({
    src: trayIconSrc,
    isDev: isDev(),
    mainWindow,
    backgroundWindow,
    feedbackWindow
  });

  tray.show();

  // Load and register user hotkey from config
  registerHotkey();
};

app.setAsDefaultProtocolClient(CHIPI_PROTOCOL, process.execPath, ["--"]);

if (app.dock) {
  app.dock.hide();
}

/**
 * The main logic to create windows
 */
app.on("ready", () => {
  initiateWindows();

  // Register open at login config
  registerOpenAtLogin();

  // Unregister and free hotkey for other apps to use, when closing Chipi.
  app.on("will-quit", () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
  });

  // Load and register feedback hotkey from config
  //registerHotkeyFeedback();

  // Show main window when user opens application, but it is already opened
  app.on("open-url", (event, path) => handleUrl(mainWindow, backgroundWindow, path));

  if (process.platform == "win32") {
    handleUrlFromArgv(process.argv);
  }
});

ipcMain.on("message", (event, payload) => {
  const toWindow = event.sender === mainWindow.webContents ? backgroundWindow : mainWindow;
  toWindow.webContents.send("message", payload);
});

//Sign In
ipcMain.on("signIn", () => {
  console.log("Received sign in");
  // Signin with chipi web client if the flag is on
  const signinUrlParams = {
    externalRedirect: CHIPI_WEB_CLIENT.externalRedirect,
    clientId: AWS_COGNITO.userPoolWebClientId
  };

  const signinUrl = `${CHIPI_WEB_CLIENT.host}?${qs.stringify(signinUrlParams)}#${
    CHIPI_WEB_CLIENT.authorizationHashPage
  }`;

  logger.verbose("Signin url", { signinUrl });
  shell.openExternal(signinUrl);
});

ipcMain.on("openFeedbackWindow", () => {
  // The canToggleOff to false when displaying the feedback window
  mainWindow.canToggleOff = false;

  const feedbackWindowOnClose = () => {
    mainWindow.canToggleOff = true;
  };

  createFeedbackWindow(mainWindow)
    .then(() => {
      feedbackWindowOnClose();
    })
    .catch(() => {
      // Chrome 59 doesn't support promise.finally function. Use catch and try to simulate it
      feedbackWindowOnClose();
    });
});

//Sign Out
ipcMain.on("signOut", () => {
  backgroundWindow.webContents.send("message", { message: "signOut" });

  mainWindow.webContents.send("message", {
    message: "showTerm",
    payload: ""
  });
});

ipcMain.on("applicationReady", () => {
  initAutoUpdater(mainWindow);
});

ipcMain.on("sendFeedback", (event, payload) => {
  mainWindow.webContents.send("message", {
    message: "sendFeedback",
    payload: JSON.parse(payload)
  });
});

ipcMain.on("reloadWindows", () => {
  initiateWindows();
});

ipcMain.on("updateSettings", (event, key, value) => {
  logger.verbose("updateSettings called", { event, key, value });

  mainWindow.settingsChanges.emit(key, value);

  // Show or hide menu bar icon when it is changed in setting
  if (key === "showInTray") {
    value ? tray.show() : tray.hide();
  }

  // Show or hide "development" section in tray menu
  if (key === "developerMode") {
    tray.setIsDev(isDev());
  }

  if (key === "onboardingFinished") {
    config.set("onboardingFinished", value);
  }

  if (key === "openAtLogin") {
    config.set("openAtLogin", value);
    autoStart.set(value);
  }

  if (key === "hotkey") {
    const currentShortcut = config.get("hotkey");
    config.set("hotkey", value);
    registerHotkey();
  }
});
