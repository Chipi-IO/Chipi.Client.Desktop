import { shell, clipboard } from "electron";
import { icons } from "../../../images";
import S from "string";
import Logger from "../../../../../../lib/logger";
import { formatTimestamp } from "../../util";
import { chipiUserData, ChipiConnectorService } from "../../../../../../lib/chipi";
import MessagePreview from "./Preview/message";
S.extendPrototype();

const logger = new Logger("plugin.chipi.rendering.engines.trello.message");

function toSearchResultFormat({ foundItem, additionalData, searchTerm, actions }) {
  //logger.debug('Start converting Chipi message object to display result');
  const data = foundItem._source;
  const channelObject = additionalData[data.fromChannelId] || {
    fromChannel: data.fromChannel,
    externalLinkSuggestion: "https://trello.com",
    primaryName: "Trello"
  };
  const tunnelObject = additionalData[data.fromTunnelId];

  const threadObject = data.fromThreadId && additionalData[data.fromThreadId];

  const appearedInOtherTunnelsObjects =
    data.appearedInTunnelIds &&
    data.appearedInTunnelIds
      .map(appearedInTunnelId => {
        // Only add Tunnel not equal to the main tunnelObject to the list.
        // In Trello, the message parent is the Board List. CHIPI treats the list as the implicit tunnel, which means the direct parent Tunnel for the Trello card is the Board in CHIPI. List becomes the one of the item within the appeardInTunnelIds list
        if (appearedInTunnelId != data.fromTunnelId) {
          const additionalTunnel = additionalData[appearedInTunnelId];

          if (!additionalTunnel) {
            logger.verbose("Didn't found appearedInTunnelId from additional data", {
              appearedInTunnelId
            });
          }

          return additionalTunnel;
        }
        return;
      })
      .filter(Boolean);

  logger.verbose("Thread object", { threadObject });

  const url = data.externalLinkSuggestion || "https://trello.com";
  const boardUrl = tunnelObject && tunnelObject.externalLinkSuggestion;
  const messageTitle = data.subject || (threadObject && threadObject.subject);

  return chipiUserData.instance
    .getPersonById(data.sentByPersonId)
    .then(sentByPerson => {
      let resultItem = {
        id: foundItem._id,
        tunnel: tunnelObject && tunnelObject.name,
        chipi: {
          channel: {
            icon: icons[data.fromChannel],
            fromChannel: channelObject.fromChannel,
            primaryName: channelObject.primaryName,
            secondaryName: channelObject.secondaryName,
            primaryImage: channelObject.primaryImage,
            channelOnClick: event => {
              event.stopPropagation();
              actions.open(channelObject.externalLinkSuggestion);
            }
          },
          tunnel: {
            ...tunnelObject,
            tunnelOnClick: event => {
              event.stopPropagation();
              if (!boardUrl) {
                return;
              }
              actions.open(boardUrl);
            }
          },
          sentByPerson: sentByPerson && {
            image: sentByPerson.image,
            name: sentByPerson.name,
            displayName: sentByPerson.displayName
          }
        },
        icon: icons[data.fromChannel],
        sentByPerson: sentByPerson && {
          image: sentByPerson.image,
          title: sentByPerson.name
        },
        avatars: sentByPerson && [
          {
            src: sentByPerson.image,
            title: sentByPerson.displayName
          }
        ],
        title: messageTitle,
        breadcrumbTitle: messageTitle,
        subtitle: `${threadObject ? "[comment] " : ""}${data.text || ""}`,
        timestamp: data.updatedAt
          ? formatTimestamp(data.updatedAt)
          : data.createdAt && formatTimestamp(data.createdAt),
        onSelect: () => {
          actions.open(url);
        },
        getPreview: () => {
          return (
            <MessagePreview
              messageObject={data}
              threadObject={threadObject}
              tunnelObject={tunnelObject}
              appearedInOtherTunnelsObjects={appearedInOtherTunnelsObjects}
            />
          );
        }
      };

      const resultAction = [
        {
          name: "Open",
          longName: "Open Card",
          keys: "enter",
          propogateEvent: false,
          fn: (event, action) => {
            actions.open(url);
            event.preventDefault();
          }
        },
        boardUrl && {
          name: "Open Board",
          longName: "Open Board",
          keys: "CmdOrCtrl+enter",
          propogateEvent: false,
          fn: (event, action) => {
            actions.open(boardUrl);
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
          allowedActions: ["Open", "Open Board"]
        }
      ].filter(Boolean);

      resultItem.actions = resultAction;

      return resultItem;
    })
    .catch(err => {
      logger.error("Failed to process trello message", { err });
      throw err;
    });
}

export default {
  toSearchResultFormat
};
