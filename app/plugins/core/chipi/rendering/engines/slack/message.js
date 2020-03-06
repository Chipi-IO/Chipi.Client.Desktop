import { shell, clipboard } from "electron";
import { icons } from "../../../images";
import S from "string";
import Logger from "../../../../../../lib/logger";
import { shorten, formatTimestamp } from "../../util";
import slackParser from "./lib/parser";
import { chipiUserData } from "../../../../../../lib/chipi";
import Preview from "./Preview";

const logger = new Logger("ChipiSearchResultMessage");

S.extendPrototype();

function toSearchResultFormat({ foundItem, additionalData, searchTerm, actions }) {
  const data = foundItem._source;
  //logger.debug('Start converting Chipi message object to display result');

  // "fromTunnelId":"Google_115601810775932575598~slack~T97AXDA2X-U97AY7TMH~tunnel~D96Q3PBDE"
  const teamId = data.fromChannelAccount.split("-")[0];
  const slackChannelId = /tunnel~(.+)/g.exec(data.fromTunnelId)[1];
  const messageId = data.rawIdentity && data.rawIdentity.id;
  const messageIdParam = messageId ? `&message=${messageId}` : "";
  const messageThreadId = data.fromThreadId
    ? /message~(.+)/g.exec(data.fromThreadId)[1]
    : undefined;
  const messageThreadIdParam = messageThreadId ? `&thread_ts=${messageThreadId}` : "";

  const slackHttpUrl = `https://slack.com/app_redirect?team=${teamId}&channel=${slackChannelId}${messageIdParam}${messageThreadIdParam}`;
  const channelUrl = `https://slack.com/app_redirect?app=${teamId}`;
  const tunnelUrl = `https://slack.com/app_redirect?team=${teamId}&channel=${slackChannelId}`;

  let slackAppUrl, channelAppUrl, tunnelAppUrl;
  switch (slackChannelId[0]) {
    case "F":
      slackAppUrl = `slack:\/\/file?team=${teamId}&id=${slackChannelId}`; // File message
      channelAppUrl = `slack:\/\/file?app=${teamId}`;
      tunnelAppUrl = `slack:\/\/file?team=${teamId}&id=${slackChannelId}`;
      break;
    default:
      slackAppUrl = `slack:\/\/channel?team=${teamId}&id=${slackChannelId}${messageIdParam}${messageThreadIdParam}`; // Channel 'C' message
      channelAppUrl = `slack:\/\/channel?app=${teamId}`;
      tunnelAppUrl = `slack:\/\/channel?team=${teamId}&id=${slackChannelId}`;
  }

  const avatars = [];
  /*
  data.mentionedPersonIds && data.mentionedPersonIds.forEach(id => {
    const replacedId = id.replace('@', '') // TODO: This is a hack - backend should include or exclude @ symbol
    const person = additionalData[replacedId]
    if(person && avatars.findIndex(a => a.src === person.image) === -1) { // TODO: remove this dedupe hack; backend returns duplicates
      avatars.push({
        src: person.image,
        title: person.displayName
      })
    }
  })*/

  /*
  if (data.sentByPersonId) {
    chipiUserData.instance.getPersonById(data.sentByPersonId)

    const person = additionalData[data.sentByPersonId];
    if (person && avatars.findIndex(a => a.src === person.image) === -1) { // TODO: remove this dedupe hack; backend returns duplicates
      avatars.push({
        src: person.image,
        title: person.displayName
      })
    }
  }*/

  if (!data.text) {
    logger.warn("Data record doesn't have the text property", { data });
    return Promise.resolve();
  }

  return slackParser.slackMarkdownToHtml(data.text).then(slackFormattedText => {
    return chipiUserData.instance
      .getPersonById(data.sentByPersonId)
      .then(sentByPerson => {
        //logger.verbose('Slack formatted text', { slackFormattedText, sentByPerson });
        var tunnelObject = additionalData[data.fromTunnelId];
        var channelObject = additionalData[data.fromChannelId] || { fromChannel: data.fromChannel };

        const resultItem = {
          id: foundItem._id,
          chipi: {
            channel: {
              icon: icons[channelObject.fromChannel],
              fromChannel: channelObject.fromChannel,
              primaryName: channelObject.primaryName,
              secondaryName: channelObject.domain,
              primaryImage: channelObject.primaryImage,
              domain: channelObject.email_domain,
              channelOnClick: event => {
                event.stopPropagation();
                openSlack(channelAppUrl, channelUrl, actions);
              }
            },
            tunnel: {
              ...tunnelObject,
              prefix: "#", // optional tunnel prefix (used to display # in front of slack channel name)
              tunnelOnClick: event => {
                event.stopPropagation();
                openSlack(tunnelAppUrl, tunnelUrl, actions);
              }
            },
            sentByPerson: sentByPerson && {
              image: sentByPerson.image,
              name: sentByPerson.displayName
            },
            mimeType: {
              icon: data.iconSuggestion,
              name: data.mimeTypeSuggestion || "Message",
              normalizedName: "Message"
            }
          },
          icon: icons[data.fromChannel],
          tunnel: additionalData[data.fromTunnelId] && additionalData[data.fromTunnelId].name,
          sentByPerson: sentByPerson && {
            image: sentByPerson.image,
            title: sentByPerson.displayName
          },
          avatars: sentByPerson && [
            {
              src: sentByPerson.image,
              title: sentByPerson.displayName || sentByPerson.name
            }
          ],
          timestamp: data.createdAt && formatTimestamp(data.createdAt),
          subtitle: slackFormattedText[1].replace(/<(?:.|\n)*?>/gm, ""), // remove html tags for the list row
          renderingSubtitleAsHtml: true,
          //getTitle(data).escapeHTML().s,
          onSelect: () => {
            openSlack(slackAppUrl, slackHttpUrl, actions);
          },
          getPreview: () => {
            return <Preview parsedSlackText={slackFormattedText[1]} tunnel={tunnelObject} />;
          }
        };

        const resultAction = [
          {
            name: "Copy message",
            keys: "CmdOrCtrl+c",
            fn: (event, action) => {
              clipboard.writeText(data.text);
              event.preventDefault();
            },
            ignoreWhenTextHighlighted: true
          },
          {
            name: "Open",
            longName: "Show in Slack",
            keys: "enter",
            propogateEvent: false,
            fn: (event, action) => {
              openSlack(slackAppUrl, slackHttpUrl, actions);
              event.preventDefault();
            }
          },
          {
            name: "Details",
            keys: "right",
            fn: event => {
              actions.openDetailsView("Details", resultItem);
              event.preventDefault();
            },
            allowedActions: ["Open", "Copy message"]
          }
        ];

        resultItem.actions = resultAction;

        return resultItem;
      })
      .catch(err => {
        logger.error("Failed to process slack message", { err });
        throw err;
      });
  });
}

function openSlack(appUrl, httpUrl, actions) {
  logger.verbose("Open slack link", { appUrl, httpUrl });
  if (!actions.open(appUrl)) {
    actions.open(httpUrl);
  }
}

function getTitle(data) {
  return shorten(data.title ? data.title : data.text, 150);
}

export default {
  toSearchResultFormat
};
