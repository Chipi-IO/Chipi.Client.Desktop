import { buffer } from "file-icon";
import memoize from "memoizee";
import Logger from "../../../../../lib/logger";
import { remote } from "electron";

const logger = new Logger("smartIcon.getFileIcon");

function getFileIcon(path) {
  if (process.platform === "darwin") {
    return buffer(path).then(data => {
      const imgData =
        "data:image/png;base64," + data.toString('base64');
      return imgData;
    });
  }
  if (process.platform === "win32") {
    return new Promise((accept, reject) => {
      remote.app.getFileIcon(path, (err, icon) => {
        if (err) return reject(err);

        accept(icon.toDataURL());
      });
    });
  }

  return Promise.reject();
}

export default memoize(getFileIcon);
