import * as os from "os";
import { dialog, } from 'electron'
import { autoUpdater } from "electron-updater";
import checkForUpdates from "./lib/checkForUpdates"
const event = 'update-downloaded'

export default (w) => {
  setTimeout(() => {
    checkForUpdates(w, true, false, true);
  }, 10 * 1000)

  setInterval(() => {
    checkForUpdates(w, true, false, true);
  }, 60 * 60 * 1000)
}