const prefixedKey = "recent";

/**
 * Get filter item by filter key
 * @param {String} key
 */
const _getFilterItem = key => {
  return {
    label: `:${key} `,
    description: `my recent work items`,
    type: `recent`,
    supportAutoFill: true
  };
};

/**
 * Find auto complete time filters with user provide search path
 * @param {Array} searchPath Search path for filter to provide auto complete items
 */
const findAutoCompleteItemsAsync = async searchPath => {
  if (!searchPath || searchPath.length == 0 || prefixedKey.startsWith(searchPath[0])) {
    return Promise.resolve([_getFilterItem(prefixedKey)]);
  }

  return Promise.resolve();
};

export default {
  prefixedKeys: [prefixedKey],
  findAutoCompleteItemsAsync
};
