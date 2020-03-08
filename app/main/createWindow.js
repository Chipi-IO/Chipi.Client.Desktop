import { BrowserWindow, globalShortcut, app, screen, shell, protocol } from "electron";
import debounce from "lodash/debounce";
import EventEmitter from "events";

import { INPUT_HEIGHT, WINDOW_WIDTH, MAX_WINDOW_HEIGHT } from "./constants/ui";

import buildMenu from "./createWindow/buildMenu";
import toggleWindow from "./createWindow/toggleWindow";
import config from "../lib/config";
import getWindowPosition from "../lib/getWindowPosition";
import Logger from "../lib/logger";

const logger = new Logger("MainCreateWindow");

export default ({ src, isDev }) => {
  const [x, y] = getWindowPosition({});
  //const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const iconSrc = () => {
    switch (process.platform) {
      case "darwin":
        return `${__dirname}/resources/icon.ico`;
      case "win32":
        return `${__dirname}/resources/icon-white.ico`;
      default:
        return `${__dirname}/resources/icon.ico`;
    }
  };

  const browserWindowOptions = {
    width: WINDOW_WIDTH,
    minWidth: WINDOW_WIDTH,
    height: MAX_WINDOW_HEIGHT,
    x,
    y,
    frame: false,
    resizable: false,
    hasShadow: false,
    titlebarAppearsTransparent: false,
    // Show main window on launch only when application started for the first time
    show: false,
    transparent: true,
    maximizable: false,
    titleBarStyle: "customButtonsOnHover",
    minimizable: false,
    closable: false,
    icon: iconSrc(),
    webPreferences: {
      plugins: true,
      nodeIntegration: true
    }
  };

  if (process.platform === "linux") {
    browserWindowOptions.type = "splash";
  }

  const mainWindow = new BrowserWindow(browserWindowOptions);

  // A value to help the window to be toggled off under some condition
  // TODO: We need to remove this condition once the secondary window embed into the main window
  mainWindow.canToggleOff = true;

  // Float main window above full-screen apps
  //mainWindow.setAlwaysOnTop(true, 'modal-panel')

  mainWindow.loadURL(src, { protocol: "file:" });
  mainWindow.settingsChanges = new EventEmitter();

  // Function to toggle main window
  const toggleMainWindow = () => toggleWindow(mainWindow);

  // Function to show main window
  const showMainWindow = () => {
    mainWindow && mainWindow.show();
    mainWindow && mainWindow.focus();
  };

  // TODO: Fix blur so search bar parent window doesn't hide sign in child window
  // mainWindow.on('blur', () => {
  //   if (!isDev()) {
  //     // Hide window on blur in production
  //     // In development we usually use developer tools that can blur a window
  //     mainWindow.hide()
  //   }
  // })

  // Save window position when it is being moved
  /*mainWindow.on('move', debounce(() => {
    if (!mainWindow.isVisible()) {
      return
    }
    const display = screen.getPrimaryDisplay()
    const positions = config.get('positions') || {}
    positions[display.id] = mainWindow.getPosition()
    config.set('positions', positions)
  }, 100))*/


  mainWindow.on("close", () => {
    app.quit();
  });

  mainWindow.webContents.on("new-window", (event, url) => {
    shell.openExternal(url);
    event.preventDefault();
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      shell.openExternal(url);
      event.preventDefault();
    }
  });

  // Change global hotkey if it is changed in app settings
  mainWindow.settingsChanges.on("hotkey", value => {
    const currentShortcut = config.get("hotkey");
    globalShortcut.unregister(currentShortcut);
    config.set("hotkey", value);
    globalShortcut.register(value, toggleMainWindow);
  });

  // Change theme css file
  mainWindow.settingsChanges.on("theme", value => {
    mainWindow.webContents.send("message", {
      message: "updateTheme",
      payload: value
    });
  });

  // Once window finish load the dom, display as required
  mainWindow.webContents.on("did-finish-load", () => {
    logger.info("Main window contents did finish load");
    if (config.get("firstStart")) {
      showMainWindow();
      // Save in config information, that application has been started
      config.set("firstStart", false);
    }
  });

  // Handle window.hide: if cleanOnHide value in preferences is true
  // we clear all results and show empty window every time
  const resetResults = () => {
    mainWindow.webContents.send("message", {
      message: "showTerm",
      payload: ""
    });
  };

  // Handle change of cleanOnHide value in settins
  const handleCleanOnHideChange = value => {
    if (value) {
      mainWindow.on("hide", resetResults);
    } else {
      mainWindow.removeListener("hide", resetResults);
    }
  };

  // Set or remove handler when settings changed
  mainWindow.settingsChanges.on("cleanOnHide", handleCleanOnHideChange);

  // Set initial handler if it is needed
  //We don't want to clean the screen on hide at the moment
  handleCleanOnHideChange(false /*config.get('cleanOnHide')*/);

  // Restore focus in previous application
  // MacOS only: https://github.com/electron/electron/blob/master/docs/api/app.md#apphide-macos
  if (process.platform === "darwin") {
    /*mainWindow.on('hide', () => {
      app.hide()
    })*/
  }

  app.on("activate", showMainWindow);

  // Someone tried to run a second instance, we should focus our window.
  // const shouldQuit = app.makeSingleInstance(() => {
  //   if (mainWindow) {
  //     if (mainWindow.isMinimized()) mainWindow.restore()
  //     mainWindow.focus()
  //   }
  // })

  // if (shouldQuit) {
  //   app.quit()
  // }

  // Track app start event
  /*trackEvent({
    category: 'App Start',
    event: config.get('firstStart') ? 'First' : 'Secondary'
  })*/

  //screenView('Search')

  buildMenu(mainWindow);
  return mainWindow;
};
