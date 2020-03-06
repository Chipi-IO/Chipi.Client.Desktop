import { shell, clipboard } from "electron";
import { icons } from "../../../images";
import S from "string";
import Logger from "../../../../../../lib/logger";
import { formatTimestamp } from "../../util";
import { chipiUserData, ChipiConnectorService } from "../../../../../../lib/chipi";
import TunnelPreview from "./Preview/tunnel";
S.extendPrototype();

const logger = new Logger("plugin.chipi.rendering.engines.trello.tunnel");

function toSearchResultFormat({ foundItem, additionalData, searchTerm, actions }) {
  //logger.debug('Start converting Chipi message object to display result');
  const data = foundItem._source;

  // We don't want to display the implicit tunnel to the search output
  if (data.isImplicit) {
    return Promise.resolve();
  }

  const channelObject = additionalData[data.fromChannelId] || {
    fromChannel: data.fromChannel
  };

  const boardUrl = data.externalLinkSuggestion || "https://trello.com";

  let resultItem = {
    id: foundItem._id,
    account: channelObject && channelObject.primaryName,
    chipi: {
      channel: {
        icon: icons[data.fromChannel],
        fromChannel: channelObject.fromChannel,
        primaryName: channelObject.primaryName,
        secondaryName: channelObject.secondaryName,
        primaryImage: channelObject.primaryImage
      }
    },
    icon: icons[data.fromChannel],
    title: `[Board] ${data.name}`,
    timestamp: data.updatedAt
      ? formatTimestamp(data.updatedAt)
      : data.createdAt && formatTimestamp(data.createdAt),
    onSelect: () => {
      actions.open(boardUrl);
    },
    getPreview: () => {
      return <TunnelPreview tunnelObject={data} />;
    }
  };

  const resultAction = [
    boardUrl && {
      name: "Open Board",
      longName: "Open Board",
      keys: "enter",
      propogateEvent: false,
      fn: (event, action) => {
        actions.open(boardUrl);
        event.preventDefault();
      }
    },
    boardUrl && {
      name: "Copy Url",
      keys: "CmdOrCtrl+c",
      fn: (event, action) => {
        clipboard.writeText(boardUrl);
        event.preventDefault();
      }
    }
    /*, No preview for now
    {
      name: "Details",
      keys: "right",
      fn: event => {
        actions.openDetailsView("Details", resultItem);
        event.preventDefault();
      },
      allowedActions: ["Open Board"]
    }*/
  ].filter(Boolean);

  resultItem.actions = resultAction;

  return Promise.resolve(resultItem);
}

export default {
  toSearchResultFormat
};
