import { parse } from "url";
import Logger from "../../lib/logger";
//import { on, send } from '../../lib/rpc'
import { showWindow } from "./toggleWindow";

const logger = new Logger("createWindow.handleUrl");

export default (mainWindow, backgroundWindow, url) => {
  const { host: action, query } = parse(url, { parseQueryString: true });
  logger.verbose("Handle url from chipi protocol", { action, query, url });
  // Currently only search action supported.
  // We can extend this handler to support more
  // like `plugins/install` or do something plugin-related
  switch (action.toLowerCase()) {
    case "authreturn":
      backgroundWindow.webContents.send("message", {
        message: "authCodeReceived",
        payload: query.code
      });
      showWindow(mainWindow);
      return;
    default:
      showWindow(mainWindow);
      return;
  }
};
