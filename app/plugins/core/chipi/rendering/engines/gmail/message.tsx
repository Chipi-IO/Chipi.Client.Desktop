import { shell, clipboard } from "electron";
import { icons } from "../../../images";
import S from "string";
import Logger from "../../../../../../lib/logger";
import { shorten, formatTimestamp } from "../../util";
import { chipiUserData } from "../../../../../../lib/chipi";
import Preview from "./Preview";
import chipiPlugin from "../../../index";
import marked from "marked";
import {
  ISearchResultItem,
  IChipiFoundItem,
  ISearchResultItemAction
} from "@app/models/interfaces";

const logger = new Logger("ChipiSearchResultMessage");
const hangoutsChannelName = "hangouts";

S.extendPrototype();

const toSearchResultFormat = async (
  chipiFoundItem: IChipiFoundItem
): Promise<ISearchResultItem> => {
  const { foundItem, additionalData, searchTerm = "+", clientActions } = chipiFoundItem;

  //logger.debug('Start converting Chipi message object to display result');
  const httpUrl = generateMessageUrl(foundItem, additionalData, searchTerm);

  const data = foundItem._source;

  //const channelObject = additionalData[data.fromChannelId];
  const channelObject = additionalData[data.fromChannelId] || { fromChannel: data.fromChannel };
  const channelUrl = getChannelUrl(foundItem, additionalData);
  const htmlContent = marked(data.text);

  const subtitle = data.displaySuggestion
    ? decodeHtml(data.displaySuggestion)
    : decodeHtml(data.text);

  return chipiUserData.instance
    .getPersonById(data.sentByPersonId)
    .then(sentByPerson => {
      const isHangouts = data.directChannel === hangoutsChannelName;
      const resultItem: ISearchResultItem = {
        id: foundItem._id,
        chipi: {
          channel: {
            icon: icons[data.directChannel ? data.directChannel : channelObject.fromChannel],
            fromChannel: channelObject.fromChannel,
            primaryName: channelObject.primaryName,
            secondaryName: channelObject.domain,
            primaryImage: channelObject.primaryImage,
            domain: channelObject.email_domain,
            channelOnClick: event => {
              event.stopPropagation();
              clientActions.open(channelUrl);
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
        title: isHangouts ? subtitle : data.subject,
        subtitle: data.directChannel === hangoutsChannelName ? undefined : subtitle,
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
        htmlContent,
        onSelect: () => {
          clientActions.open(httpUrl);
        },
        getPreview: () => {
          const previewProps = {
            subject: data.subject,
            htmlContent,
            isHangouts: isHangouts
          };

          return <Preview {...previewProps} />;
        }
      };

      const resultActions: ISearchResultItemAction[] = [
        {
          name: "Copy message",
          keys: "CmdOrCtrl+c",
          fn: event => {
            clipboard.writeText(data.text);
            event.preventDefault();
          },
          ignoreWhenTextHighlighted: true,
          availableInDetailsView: true
        },
        {
          name: "Open",
          longName: "Show in Gmail",
          keys: "enter",
          fn: event => {
            clientActions.open(httpUrl);
            event.preventDefault();
          },
          availableInDetailsView: true
        },
        {
          name: "Full Thread",
          longName: "Full Thread",
          keys: "shift+space",
          fn: (event, action) => {
            clientActions.openFullThread(resultItem);
            event.preventDefault();
          },
          availableInDetailsView: true
        },
        {
          name: "Details",
          keys: "right",
          fn: event => {
            clientActions.openDetailsView("Details", resultItem);
            event.preventDefault();
          },
          availableInDetailsView: false,
          allowedActions: ["Open", "Full Thread", "Copy message"]
        }
      ];

      resultItem.actions = resultActions;

      resultItem.fullConversation = {
        conversationItems: async () => {
          return chipiPlugin.searchThreadAsync(chipiFoundItem);
        },
        currentResultItemId: resultItem.id
      };

      return resultItem;
    })
    .catch(err => {
      logger.error("Failed to process gmail message", { err });
      throw err;
    });
};

function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

/**
 * Generate message target url
 * @param {*} foundItem
 * @param {*} additionalData
 */
function generateMessageUrl(foundItem, additionalData, searchTerm) {
  const messageId = foundItem._source.rawIdentity && foundItem._source.rawIdentity.id;
  const fromChannelObject = additionalData[foundItem._source.fromChannelId];
  const accountEmail =
    fromChannelObject && fromChannelObject.rawIdentity && fromChannelObject.rawIdentity.email;

  const accountPromptSegment = accountEmail ? `${accountEmail}/` : "";
  //const gmailTargetUrlPrefix = `https://mail.google.com/mail`

  let messageUrl = `https://mail.google.com/mail/#search/${searchTerm
    .replace(/\s/gi, "+")
    .replace(/"/g, "'")}/${messageId}`;

  //let tunnel = additionalData[foundItem._source.fromTunnelId];
  if (foundItem._source.directChannel === hangoutsChannelName) {
    //httpUrl = `https://mail.google.com/mail/u/0/?ui=2&view=btop&ver=1grgaenfova1b&q=${searchTerm}&qs=true&search=query&th=${tunnel.rawIdentity.id}&qt=${searchTerm}&cvid=1`
    //https://mail.google.com/mail/u/0/?ui=2&view=btop&ver=1grgaenfova1b&search=chats&th=${tunnel.rawIdentity.id}&cvid=1`
    messageUrl = `https://mail.google.com/mail/#chats/${searchTerm
      .replace(/\s/gi, "+")
      .replace(/"/g, "'")}/${messageId}`;
  }

  messageUrl = `${messageUrl}?authuser=${accountEmail}`;

  let httpUrl = `https://accounts.google.com/AccountChooser?continue=${encodeURIComponent(
    messageUrl
  )}&Email=${accountEmail}&service=mail`;

  return httpUrl;
}

/**
 * Returns channel URL
 * @param {*} foundItem
 * @param {*} additionalData
 */
function getChannelUrl(foundItem, additionalData) {
  const fromChannelObject = additionalData[foundItem._source.fromChannelId];
  const accountEmail =
    fromChannelObject && fromChannelObject.rawIdentity && fromChannelObject.rawIdentity.email;
  return `https://accounts.google.com/AccountChooser?Email=${accountEmail}&service=mail`;
}

export default {
  toSearchResultFormat
};
