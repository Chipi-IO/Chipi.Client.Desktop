import { shell, clipboard } from "electron";
import { icons } from "../../../images";
import S from "string";
import Logger from "../../../../../../lib/logger";
import { formatTimestamp } from "../../util";
S.extendPrototype();

const logger = new Logger("plugin.chipi.rendering.engines.slack.tunnel");

function toSearchResultFormat({ foundItem, additionalData, searchTerm, actions }) {
  //logger.debug('Start converting Chipi message object to display result');
  const data = foundItem._source;

  const channelObject = additionalData[data.fromChannelId] || {
    fromChannel: data.fromChannel
  };

  const teamId = data.fromChannelAccount.split("-")[0];
  const slackChannelId = /tunnel~(.+)/g.exec(foundItem._id)[1];

  const slackHttpUrl = `https://slack.com/app_redirect?team=${teamId}&channel=${slackChannelId}`;
  const slackAppUrl = `slack:\/\/channel?team=${teamId}&id=${slackChannelId}`;

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
    title: `# ${data.name}`,
    timestamp: data.updatedAt
      ? formatTimestamp(data.updatedAt)
      : data.createdAt && formatTimestamp(data.createdAt)
  };

  const resultAction = [
    {
      name: "Open Channel",
      longName: "Open Channel",
      keys: "enter",
      propogateEvent: false,
      fn: (event, action) => {
        _openSlack(slackAppUrl, slackHttpUrl, actions);
        event.preventDefault();
      }
    },
    {
        name: "Copy Url",
        keys: "CmdOrCtrl+c",
        fn: (event, action) => {
          clipboard.writeText(slackHttpUrl);
          event.preventDefault();
        }
    },
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

const _openSlack = (appUrl, httpUrl, actions) => {
    logger.verbose("Open slack link", { appUrl, httpUrl });
    if (!actions.open(appUrl)) {
      actions.open(httpUrl);
    }
  }

export default {
  toSearchResultFormat
};
