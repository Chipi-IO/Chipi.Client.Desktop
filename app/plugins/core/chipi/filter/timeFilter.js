const prefixedKeys = ["within"];

/**
 * The available time ranges for filtering
 */
const _timeRanges = [
  {
    value: "1d",
    description: "from 1 day ago to now"
  },
  {
    value: "3d",
    description: "from 3 days ago to now"
  },
  {
    value: "2w",
    description: "from 2 weeks ago to now"
  },
  {
    value: "1m",
    description: "from 1 month ago to now"
  },
  {
    value: "2m",
    description: "from 2 months ago to now"
  },
  {
    value: "6m",
    description: "from 6 months ago to now"
  },
  {
    value: "1y",
    description: "from 1 year ago to now"
  }
];

/**
 * Get filter item by filter key and time string
 * @param {String} key
 * @param {Object} timeRange
 */
const _getFilterItem = (key, timeRange) => {
  return {
    label: `:${key}:${timeRange ? timeRange.value + " " : ""}`,
    description: timeRange ? timeRange.description : `search by time range`,
    value: timeRange && timeRange.value,
    type: `time`,
    supportAutoFill: true
  };
};

/**
 * Find auto complete time filters with user provide search path
 * @param {Array} searchPath Search path for filter to provide auto complete items
 */
const findAutoCompleteItemsAsync = async searchPath => {
  if (!searchPath || searchPath.length == 0) {
    return prefixedKeys.map(prefixedKey => {
      return _getFilterItem(prefixedKey);
    });
  }

  const matchedFilterKeyIndex = prefixedKeys.findIndex(prefixedKey => {
    return prefixedKey.startsWith(searchPath[0]);
  });

  if (matchedFilterKeyIndex == -1) {
    return;
  }

  const filterKey = prefixedKeys[matchedFilterKeyIndex];

  // Return the filter key only if the search path only has first part
  if (searchPath.length == 1) {
    return [_getFilterItem(filterKey)];
  }

  const timeRangeTerm = searchPath[1];

  return _timeRanges
    .map(timeRange => {
      if (
        !timeRangeTerm ||
        timeRangeTerm.length == 0 ||
        timeRange.value.startsWith(timeRangeTerm)
      ) {
        return _getFilterItem(filterKey, timeRange);
      }
    })
    .filter(Boolean);
};

export default {
  prefixedKeys,
  findAutoCompleteItemsAsync
};
