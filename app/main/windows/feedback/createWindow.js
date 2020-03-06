import { BrowserWindow } from "electron";
import Logger from "../../../lib/logger";
import { isDev } from "Environment/";
import path from "path";

const logger = new Logger("windows.feedback.createWindow");

let windowOpen = false;
export default (parent) => {
  return new Promise((resolve, reject) => {
    if (!windowOpen) {
      windowOpen = true;
    } else {
      resolve();
      return;
    }

    let feedbackWindow = new BrowserWindow({
      width: 500,
      height: 380,
      show: false,
      modal: true,
      parent,
      title: "Send feedback",
      webPreferences: {
        partition: "feedback"
      },
      resizable: false,
      alwaysOnTop: true,
      nodeIntegration: false,
      frame: false,
      maximizable: false
    });

    feedbackWindow.loadURL(
      `file://${__dirname}/main/windows/feedback/feedback.html`
    );

    feedbackWindow.once("ready-to-show", () => {
      logger.info("Feedback window loaded");
      feedbackWindow.show();
      if (isDev()) {
        feedbackWindow.webContents.openDevTools({ mode: "detach" });
      }
    });

    feedbackWindow.on("closed", () => {
      windowOpen = false;
      feedbackWindow = null;
      resolve();
    });

    parent.feedbackWindow = feedbackWindow;
  });
};
