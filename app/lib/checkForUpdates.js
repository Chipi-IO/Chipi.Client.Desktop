import { dialog, app, Notification } from "electron";
import { autoUpdater } from "electron-updater";
import os from "os";
import Logger from "./logger";
import { CHECK_UPDATES } from "Environment";

const logger = new Logger("checkForUnpdates");
const dialogTitle = "CHIPI Updates";
const currentVersion = app.getVersion();

let isChecking = false;

// export this to MenuItem click callback
export default (
  window,
  autoDownloadEnabled = false,
  showUpdateNotAvailable = true,
  silentError = false
) => {
  logger.verbose("Check update is called", {
    isChecking,
    showUpdateNotAvailable,
    autoDownloadEnabled
  });

  // We don't do update check for development env
  if (!CHECK_UPDATES || os.platform() === "linux") {
    /*dialog.showMessageBox({
      type: "info",
      title: dialogTitle,
      message: `CHIPI upgrade is not available. \nEnvironment: ${
        process.env.NODE_ENV
      } \nPlatform: ${os.platform()}`,
      buttons: ["Close"]
    });*/
    return;
  }

  if (isChecking) {
    if (!autoDownloadEnabled) {
      dialog.showMessageBox({
        type: "info",
        title: dialogTitle,
        message: `CHIPI upgrade in progress`,
        buttons: ["Close"]
      });
    }
    return;
  }

  autoUpdater.removeAllListeners();
  autoUpdater.autoDownload = autoDownloadEnabled;

  autoUpdater.on("error", error => {
    logger.error("Error occured during update check", (error.stack || error).toString());
    isChecking = false;

    if (silentError) return;
    switch (error.toString()) {
      case "Error: net::ERR_INTERNET_DISCONNECTED": {
        dialog.showErrorBox(
          "Error: ",
          `You seem to be offline. Get back online to check for updates.`
        );
        break;
      }
      default: {
        dialog.showErrorBox(
          "Error: ",
          `Oh no, something went wrong! CHIPI was unable to update.\n${error}`
        );
      }
    }
  });

  if (!autoDownloadEnabled) {
    autoUpdater.on("update-available", () => {
      dialog.showMessageBox(
        {
          type: "info",
          title: dialogTitle,
          message: `A new version of CHIPI is available!`,
          buttons: ["Skip", "Update"]
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            const updateDownloadingNotification = new Notification({
              title: "CHIPI - Downloading",
              body: "CHIPI will notify you once the new version is ready. "
            });

            updateDownloadingNotification.show();

            autoUpdater.downloadUpdate();
          } else {
            isChecking = false;
          }
        }
      );
    });
  }

  if (showUpdateNotAvailable) {
    autoUpdater.on("update-not-available", () => {
      dialog.showMessageBox({
        title: "No Updates",
        message: `You have the latest version of CHIPI (${currentVersion})!`
      });
      isChecking = false;
    });
  } else {
    autoUpdater.on("update-not-available", () => {
      isChecking = false;
    });
  }

  autoUpdater.on("update-downloaded", payload => {
    isChecking = false;

    /*const updateReadyNotification = new Notification({
      title: "CHIPI - Update is ready",
      body: "Restart CHIPI to automatically install the latest version!",
      actions: [{ type: "button", text: "Restart" }]
    });

    updateReadyNotification.on("action", (event, index) => {
      logger.warn("Action from update notification", { index });

      if (index == 0) {
        autoUpdater.quitAndInstall();
      }
    });

    updateReadyNotification.on("click", () => {
      autoUpdater.quitAndInstall();
    })
    
    updateReadyNotification.show();
    */

    autoUpdater.quitAndInstall();
  });

  autoUpdater.checkForUpdates();
  isChecking = true;
};
