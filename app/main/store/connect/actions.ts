import {
  ConnectsLoadedAction,
  CONNECTS_LOADED,
  FIXING_CONNECT_CLICKED,
  FixingConnectClickedAction
} from "./types";

import Logger from "@app/lib/logger";

const logger = new Logger("store.connect.actions");

export function connectsLoaded(connects: any[]): ConnectsLoadedAction {
  return {
    type: CONNECTS_LOADED,
    payload: {
      connects
    }
  };
}

export function fixingConnectClicked(): FixingConnectClickedAction {
  logger.verbose("Fixing Connect button Clicked");
  return {
    type: FIXING_CONNECT_CLICKED
  };
}
