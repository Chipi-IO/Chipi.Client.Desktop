import { chipiUserData } from "../../../../lib/chipi";
import Logger from "../../../../lib/logger";
import gdrive from "../rendering/engines/gdrive";

const logger = new Logger("plugins.chipi.filter.channelFilter");

const prefixedKey = "in";

// shortcut values can help user to use the filter quickly
const shortcutKeys = ["slack", "drive", "gdrive", "trello", "gmail", "outlook"];

/**
 * Convert shortcut value to filter value
 * @param {*} shortcutkey
 */
const _convertShortcutKeyToFilterValue = shortcutValue => {
  switch (shortcutValue) {
    case "drive":
      return "gdrive";
    default:
      return shortcutValue;
  }
};

/**
 * Get filter item by filter key, channel name and filterableTerm
 * @param {String} key
 * @param {String} fromChannel The channel name such as slack, gmail and gdrive
 * @param {String} filterableTerm The single word term can identify the channel account
 * @param {Boolean} ignoreEndingColon In some cases we want to remove the ending coln from label
 *
 */
const _getFilterItem = (key, fromChannel, filterableTerm, ignoreEndingColon = false) => {
  return {
    label: `:${key}:${fromChannel ? fromChannel + (ignoreEndingColon ? " " : ":") : ""}${
      filterableTerm ? filterableTerm + " " : ""
    }`,
    description: !fromChannel && `search by application`,
    type: `channel`,
    supportAutoFill: true
  };
};

/**
 * Find auto complete items with user provide search path
 * @param {Array} searchPath Search path for filter to provide auto complete items
 */
const findAutoCompleteItemsAsync = async searchPath => {
  if (!searchPath || searchPath.length == 0) {
    return _getFilterItem(prefixedKey);
  }

  const testKey = searchPath[0];
  const shorcutKeyIndex = shortcutKeys.indexOf(testKey);

  if (!prefixedKey.startsWith(testKey) && shorcutKeyIndex == -1) {
    return;
  }

  let channelGroupSearchTerm;
  let channelSearchTerm;

  if (shorcutKeyIndex != -1) {
    channelGroupSearchTerm = _convertShortcutKeyToFilterValue(shortcutKeys[shorcutKeyIndex]);
    channelSearchTerm = searchPath[1];
  } else {
    // Channel group search scenario
    channelGroupSearchTerm = searchPath[1];
    channelSearchTerm = searchPath[2];
  }

  // Return the filter key only if the search path only has first part
  if (!channelGroupSearchTerm && channelGroupSearchTerm != "") {
    return [_getFilterItem(prefixedKey)];
  }

  logger.verbose("Channel search term", { channelSearchTerm });

  // If channelSearchTerm is undefined, we returns channel groups only
  if (!channelSearchTerm && channelSearchTerm != "") {
    return chipiUserData.instance.listFromChannelGroups("fromChannel", 10).then(channelGroups => {
      if (!channelGroups) {
        return;
      }

      logger.verbose("Returned channel groups", { channelGroups });

      return Object.keys(channelGroups)
        .map(channelGroupName => {
          if (channelGroupSearchTerm == "" || channelGroupName.startsWith(channelGroupSearchTerm)) {
            // We want to ignore the filter lable ending colon if there is only one account linked to the channelGroup
            const ignoreEndingColon = channelGroups[channelGroupName] == 1;
            return _getFilterItem(prefixedKey, channelGroupName, undefined, ignoreEndingColon);
          }
        })
        .filter(Boolean);
    });
  }

  return chipiUserData.instance
    .findGeneralChannel(channelGroupSearchTerm, channelSearchTerm)
    .then(channels => {
      // If the channel only has one connected account, then we don't display the account detail for the suggestion
      return (
        channels &&
        channels.length > 1 &&
        channels
          .map(channel => {
            return _getFilterItem(prefixedKey, channel.fromChannel, channel.filterableTerm);
          })
          .filter(Boolean)
      );
    });
};

export default {
  findAutoCompleteItemsAsync,
  prefixedKeys: [prefixedKey],
  shortcutKeys
};
