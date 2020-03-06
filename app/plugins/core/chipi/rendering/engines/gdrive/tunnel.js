import { shell, clipboard } from "electron";
import { icons } from "../../../images";
import S from "string";
import Logger from "../../../../../../lib/logger";
import { formatTimestamp } from "../../util";
import { chipiUserData, ChipiConnectorService } from "../../../../../../lib/chipi";
import Preview from "./Preview";
S.extendPrototype();

const logger = new Logger("plugin.chipi.rendering.engines.gdrive.tunnel");

const googleAccountSwitchUrl = (continueUrl, accountEmail) => {
  let newUrl = continueUrl.indexOf("?") === -1 ? `${continueUrl}?` : `${continueUrl}&`;
  newUrl = `${newUrl}authuser=${accountEmail}`;

  logger.debug("New url for the drive item", { newUrl });

  return `https://accounts.google.com/AccountChooser?continue=${encodeURIComponent(
    newUrl
  )}&Email=${accountEmail}&service=mail`;
};

const normalizeMimeTypeName = mimeTypeName => {
  return mimeTypeName.replace("application/vnd.google-apps.", "");
};

function toSearchResultFormat({ foundItem, additionalData, searchTerm = "+", actions }) {
  //logger.debug('Start converting Chipi message object to display result');

  const openUrl = generateDriveUrl(foundItem, searchTerm);
  const data = foundItem._source;
  const tunnelObject = additionalData[data.fromTunnelId];

  const channelObject = additionalData[data.fromChannelId] || {
    fromChannel: data.fromChannel
  };

  const accountEmail =
    channelObject && channelObject.rawIdentity && channelObject.rawIdentity.email;

  logger.debug("Extracted account email", { accountEmail });

  let resultItem = {
    id: foundItem._id,
    account: channelObject && channelObject.domain,
    chipi: {
      channel: {
        icon: icons[data.fromChannel],
        fromChannel: channelObject.fromChannel,
        primaryName: channelObject.primaryName,
        secondaryName: channelObject.domain,
        primaryImage: channelObject.primaryImage,
        domain: channelObject.email_domain
      },
      tunnel: tunnelObject
    },
    icon: icons[data.directChannel ? data.directChannel : data.fromChannel],
    onSelect: () => {
      actions.open(googleAccountSwitchUrl(openUrl, accountEmail));
    },
    mimeTypeIcon: data.iconSuggestion.replace(
      "https://drive-thirdparty.googleusercontent.com/16",
      "https://drive-thirdparty.googleusercontent.com/64"
    ),
    title: data.name,
    timestamp: data.updatedAt
      ? formatTimestamp(data.updatedAt)
      : data.createdAt && formatTimestamp(data.createdAt)
  };

  resultItem.actions = [
    {
      name: "Copy Url",
      keys: "CmdOrCtrl+c",
      fn: event => {
        clipboard.writeText(openUrl);
        event.preventDefault();
      }
    },
    {
      name: "Open",
      longName: "Show in Drive",
      keys: "enter",
      fn: event => {
        actions.open(googleAccountSwitchUrl(openUrl, accountEmail));
        event.preventDefault();
      }
    }
  ].filter(Boolean);

  return Promise.resolve(resultItem);
}

/**
 * Generate message target url
 * @param {*} foundItem
 * @param {*} additionalData
 */
function generateDriveUrl(foundItem, searchTerm) {
  return foundItem._source.externalLinkSuggestion
    ? foundItem._source.externalLinkSuggestion
    : `https://drive.google.com/drive/u/0/search?q=${searchTerm}`;
}
/**
 * Generate presentation url for GDrive item
 */
function generateDrivePresentationUrl(foundItem) {
  if (foundItem._source.mimeTypeSuggestion !== "application/vnd.google-apps.presentation") return;

  return `https://docs.google.com/presentation/d/${
    foundItem._source.rawIdentity.id
  }/present#slide=id.p`;
}

export default {
  toSearchResultFormat
};
