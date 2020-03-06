import { shell, clipboard } from "electron";
import { icons } from "../../../images";
import S from "string";
import Logger from "../../../../../../lib/logger";
import { shorten, formatTimestamp } from "../../util";
import { chipiUserData } from "../../../../../../lib/chipi";
import Preview from "./Preview";

const logger = new Logger("plugin.chipi.rendering.engines.outllook.message");

S.extendPrototype();

function toSearchResultFormat({ foundItem, additionalData, actions }) {
  //logger.debug('Start converting Chipi message object to display result');
  //const httpUrl = generateMessageUrl(foundItem, additionalData, searchTerm);

  const data = foundItem._source;
  const loginHint = getLoginHint(data, additionalData);

  //const channelObject = additionalData[data.fromChannelId];
  const channelObject = additionalData[data.fromChannelId] || { fromChannel: data.fromChannel };

  const subtitle = data.displaySuggestion
    ? shorten(data.displaySuggestion, 150)
    : shorten(data.text, 150);

  return chipiUserData.instance
    .getPersonById(data.sentByPersonId)
    .then(sentByPerson => {
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
              const outlookLink = getOutlookLink(
                "https://outlook.office365.com/owa/",
                undefined,
                loginHint
              );
              actions.open(outlookLink);
            }
          },
          mimeType: {
            icon: data.iconSuggestion,
            name: data.mimeTypeSuggestion || "Message",
            normalizedName: "Message"
          }
        },
        account: channelObject && channelObject.domain,
        icon: icons[data.directChannel ? data.directChannel : data.fromChannel],
        title: data.subject,
        subtitle,
        sentByPerson: sentByPerson && {
          image: sentByPerson.image,
          title: sentByPerson.displayName || sentByPerson.name
        },
        avatars: sentByPerson && [
          {
            src: sentByPerson.image,
            title: sentByPerson.displayName
          }
        ],
        timestamp: data.createdAt && formatTimestamp(data.createdAt),
        onSelect: () => {
          actions.open(getOutlookLink(data.externalLinkSuggestion, data.rawIdentity.id, loginHint)); //openGmail(httpUrl);
        },
        getPreview: () => {
          return <Preview subject={data.subject} text={data.text} />;
        }
      };

      const resultActions = [
        {
          name: "Copy message",
          keys: "CmdOrCtrl+c",
          fn: event => {
            clipboard.writeText(data.text);
            event.preventDefault();
          },
          ignoreWhenTextHighlighted: true
        },
        {
          name: "Open",
          longName: "Show in Outlook",
          keys: "enter",
          fn: event => {
            actions.open(
              getOutlookLink(data.externalLinkSuggestion, data.rawIdentity.id, loginHint)
            );
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

      resultItem.actions = resultActions;

      return resultItem;
    })
    .catch(err => {
      logger.error("Failed to process outlook message", { err });
      throw err;
    });
}

function getOutlookLink(externalLinkSuggestion, messageId, loginHint) {
  //shell.openExternal("com.microsoft.office.outlook:/mac/QUFBQUFGLUN2Mmd1WEo5UHVLZlVhY3hiYU5FSEFQWWVpVDdMUldOQmh4Si1haTZUUFhBQUFBQUFBUXdBQVBZZWlUN0xSV05CaHhKLWFpNlRQWEFBQUFSR1pnZ0FBQT09");
  //return;
  let linkToOpen =
    externalLinkSuggestion || `https://outlook.office365.com/owa/?ItemID=${messageId}`;

  if (loginHint) {
    linkToOpen = `${linkToOpen}${linkToOpen.indexOf("?") > -1 ? "&" : "?"}login_hint=${loginHint}`;
  }

  return linkToOpen;
}

/**
 * Generate message target url
 * @param {*} foundItem
 * @param {*} additionalData
 */
function getLoginHint(data, additionalData, searchTerm) {
  const fromChannelObject = additionalData[data.fromChannelId];
  const accountEmail =
    fromChannelObject && fromChannelObject.rawIdentity && fromChannelObject.rawIdentity.email;

  return accountEmail;
}

export default {
  toSearchResultFormat
};
