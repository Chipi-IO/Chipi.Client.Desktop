import { chipiUserData } from "../../../../lib/chipi";
import Logger from "../../../../lib/logger";

const logger = new Logger("plugins.chipi.filter.tagFilter");

const prefixedKey = "tag";

// shortcut values can help user to use the filter quickly
const shortcutKeys = [];

/**
 * Get filter item by filter key, tag name
 * @param {String} key
 * @param {String} tagName The tag name
 *
 */
const _getFilterItem = (key, tagName) => {
  return {
    label: `:${key}:${tagName ? tagName + " " : ""}`,
    description: `search by tag`,
    type: `tag`,
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

  if (!prefixedKey.startsWith(testKey)) {
    return;
  }

  const tagSearchTerm = searchPath[1];

  // Return the filter key only if the search path only has first part
  if (!tagSearchTerm && tagSearchTerm != "") {
    return [_getFilterItem(prefixedKey)];
  }

  logger.verbose("Tag search term", { tagSearchTerm });

  return chipiUserData.instance.findTags(tagSearchTerm).then(tags => {
    return tags
      .map(tag => {
        return _getFilterItem(prefixedKey, tag.tagName);
      })
      .filter(Boolean);
  });
};

export default {
  findAutoCompleteItemsAsync,
  prefixedKeys: [prefixedKey],
  shortcutKeys
};
