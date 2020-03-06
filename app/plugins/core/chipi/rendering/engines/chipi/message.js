import { icons } from "../../../images";
import S from "string";
import Logger from "../../../../../../lib/logger";
import { formatTimestamp } from "../../util";
import auth from "../../../../../../lib/chipi/auth";
S.extendPrototype();

const logger = new Logger("plugin.chipi.rendering.engines.chipi.message");

function toSearchResultFormat({ foundItem, additionalData, searchTerm, actions }) {
  //logger.debug('Start converting Chipi message object to display result');
  const data = foundItem._source;
  const inBucketTunnels =
    data.inBucketTunnelIds &&
    data.inBucketTunnelIds
      .map(inBucketTunnelId => {
        const bucketTunnel = additionalData[inBucketTunnelId];
        return bucketTunnel;
      })
      .filter(Boolean);

  const channelObject = {
    fromChannel: data.fromChannel,
    externalLinkSuggestion: "https://web.chipi.io",
    primaryName: "Chipi"
  };

  const authState = auth.instance.getAuthState();

  const sentByPerson = {
    title: authState && authState.user && (authState.user.givenName || authState.user.name),
    image: authState && authState.user && authState.user.picture,
    displayName: authState && authState.user && authState.user.name
  };

  const messageTitle = data.subject;
  const tunnelObject = additionalData[data.fromTunnelId];


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
      tunnel: undefined,
      sentByPerson: sentByPerson
    },
    icon: data.iconSuggestion || icons[data.fromChannel],
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
    breadcrumbTitle: undefined,
    subtitle: data.text,
    timestamp: data.updatedAt
      ? formatTimestamp(data.updatedAt)
      : data.createdAt && formatTimestamp(data.createdAt),
    onSelect: () => {
      actions.open(data.externalLinkSuggestion);
    }
    /*getPreview: () => {
      return (
        <MessagePreview
          messageObject={data}
          threadObject={threadObject}
          tunnelObject={tunnelObject}
          appearedInOtherTunnelsObjects={appearedInOtherTunnelsObjects}
        />
      );
    }*/
  };

  const resultAction = [
    {
      name: "Open",
      longName: "Open Resource",
      keys: "enter",
      propogateEvent: false,
      fn: event => {
        actions.open(data.externalLinkSuggestion);
        event.preventDefault();
      }
    }
    /*
    {
      name: "Details",
      keys: "right",
      fn: event => {
        actions.openDetailsView("Details", resultItem);
        event.preventDefault();
      },
      allowedActions: ["Open", "Open Board"]
    }*/
  ].filter(Boolean);

  resultItem.actions = resultAction;

  return Promise.resolve(resultItem);
}

export default {
  toSearchResultFormat
};
