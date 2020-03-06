import { Menu, Tray, app, dialog, ipcMain, shell } from "electron";
import toggleWindow from "./toggleWindow";
import checkForUpdates from "../../lib/checkForUpdates";
import config from "../../lib/config";
import autoStart from "./autoStart";

/**
 * Class that controls state of icon in menu bar
 */
export default class AppTray {
  /**
   * @param  {String} options.src Absolute path for tray icon
   * @param  {Function} options.isDev Development mode or not
   * @param  {BrowserWindow} options.mainWindow
   * @param  {BrowserWindow} options.backgroundWindow
   * @return {AppTray}
   */
  constructor(options) {
    this.tray = null;
    this.options = options;
  }
  /**
   * Show application icon in menu bar
   */
  show() {
    const tray = new Tray(this.options.src);
    tray.setToolTip("Chipi");
    tray.setContextMenu(this.buildMenu());
    tray.on("double-click", event => {
      toggleWindow(this.options.mainWindow);
    });
    this.tray = tray;
  }

  setIsDev(isDev) {
    this.options.isDev = isDev;
    if (this.tray) {
      this.tray.setContextMenu(this.buildMenu());
    }
  }

  buildMenu() {
    const { mainWindow, backgroundWindow, isDev, feedbackWindow } = this.options;
    const separator = { type: "separator" };

    const template = [
      {
        label: "Toggle Chipi",
        click: () => toggleWindow(mainWindow)
      },
      {
        label: "Toggle Shortcut",
        submenu: [
          {
            label: "1.",
            accelerator: "Control+Space",
            type: "radio",
            checked: "Control+Space" === config.get("hotkey"),
            click() {
              ipcMain.emit("updateSettings", null, "hotkey", "Control+Space");
            }
          },
          {
            label: "2.",
            accelerator: "Control+Shift+Space",
            type: "radio",
            checked: "Control+Shift+Space" === config.get("hotkey"),
            click() {
              ipcMain.emit("updateSettings", null, "hotkey", "Control+Shift+Space");
            }
          },
          {
            label: "3.",
            accelerator: "Alt+Space",
            type: "radio",
            checked: "Alt+Space" === config.get("hotkey"),
            click() {
              ipcMain.emit("updateSettings", null, "hotkey", "Alt+Space");
            }
          },
          {
            label: "4.",
            accelerator: "Alt+Shift+Space",
            type: "radio",
            checked: "Alt+Shift+Space" === config.get("hotkey"),
            click() {
              ipcMain.emit("updateSettings", null, "hotkey", "Alt+Shift+Space");
            }
          }
        ]
      },
      separator,
      {
        label: "App connections",
        click: () => {
          mainWindow.webContents.send("message", {
            message: "viewAppConnections",
            payload: {}
          });
        }
      },
      separator,
      {
        label: "Send feedback",
        accelerator: "CmdOrCtrl+F",
        click: () => {
          ipcMain.emit("openFeedbackWindow");
        }
      },
      separator,
      {
        label: "Launch on startup",
        type: "checkbox",
        checked: autoStart.isEnabled(),
        click(menuItem) {
          ipcMain.emit("updateSettings", null, "openAtLogin", menuItem.checked);
        }
      },
      {
        label: "Check for updates",
        click: () => checkForUpdates(mainWindow, false, true)
      },
      separator,
      {
        label: "Install Chipi Chrome Extension",
        click: () =>
          shell.openExternal(
            "https://chrome.google.com/webstore/detail/chipi/jdmmnbfjbomplajindcameamlkohicgc?hl=en-GB&utm_source=chrome-ntp-launcher"
          )
      }
    ];

    //if (isDev) {
    template.push(separator);
    template.push({
      label: "Development",
      submenu: [
        {
          label: "DevTools (main)",
          click: () => mainWindow.webContents.openDevTools({ mode: "detach" })
        },
        {
          label: "DevTools (background)",
          click: () => backgroundWindow.webContents.openDevTools({ mode: "detach" })
        },
        {
          label: "DevTools (feeback)",
          click: () =>
            mainWindow.feedbackWindow &&
            mainWindow.feedbackWindow.webContents.openDevTools({ mode: "detach" })
        }
      ]
    });
    //}

    template.push(separator);
    template.push({
      label: "About",
      click: () => {
        const currentVersion = app.getVersion();

        dialog.showMessageBox({
          title: "Chipi",
          message: `Version: ${currentVersion}`
        });
      }
    });

    /*template.push(separator);
    template.push({
      label: "Notification test",
      click: () => {
        const testNotification = new Notification({
          title: "CHIPI - Notification Test",
          body: "Test Notification"
        });


        testNotification.on("click", () => {
          dialog.showMessageBox({
            title: "Notification clicked",
            message: `notification clicked`
          });
        });

        testNotification.show();
      }
    });*/

    template.push(separator);
    template.push(
      {
        label: "Sign out from Chipi",
        click: () => {
          ipcMain.emit("signOut");
        }
      },
      {
        label: "Quit Chipi",
        click: () => app.quit()
      }
    );

    return Menu.buildFromTemplate(template);
  }
  /**
   * Hide icon in menu bar
   */
  hide() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
