import { CHIPI_ANALYTICS } from "Environment";
import { app, remote } from "electron";
import chipiRequest from "../request";
import chipiAuth from "../auth";
import os from "os";
import Logger from "../../logger";

let logger = new Logger("lib.chipi.analytics");
const eventOS = `${os.type()} + ${os.release()}`;
const eventEnvironment = process.env.NODE_ENV;
const electronVersion = process.versions.electron;
const appVersion = (app || remote.app).getVersion();
const eventSource = "Chipi.Client.Desktop";

/**
 *
 * @param {string} action The action code
 * @param {object} targetItem The target object which indicate what the target of the action
 * @param {object} properties Addtional properties to describe the current event
 */
const addNewEvent = (action, targetItem = null, properties = null) => {
  logger.verbose("[addNewEvent] Add new event called", { action, targetItem, properties });

  const authState = chipiAuth.instance.getAuthState();

  if (!authState || !authState.isAuthenticated) {
    return;
  }

  var actor = {
    userName: authState.userName,
    email: authState.user.email,
    name: authState.user.name
  };

  if (CHIPI_ANALYTICS.analyticsEventsApiHost.length == 0) {
    return;
  }

  var addNewEventApiOptions = {
    url: `${CHIPI_ANALYTICS.analyticsEventsApiHost}/event.new`,
    data: {
      os: eventOS,
      source: eventSource,
      environment: eventEnvironment,
      timeStamp: new Date().toISOString("YYYY-MM-DDTHH:mm:ss.sssZ"),
      actor,
      action,
      target: targetItem,
      properties,
      appVersion,
      electronVersion
    },
    headers: {
      DeliveryStreamName: CHIPI_ANALYTICS.deliveryStreamName
    }
  };

  logger.debug("[addNewEvent] Add new event request options", addNewEventApiOptions);
  chipiRequest.post(addNewEventApiOptions, authState.idToken).catch(err => {
    logger.error("[addNewEvent] Failed to Add new event", { err });
  });
};

export default {
  addNewEvent
};
