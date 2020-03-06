import { chipiUserData } from "../../../../lib/chipi";
import Logger from "../../../../lib/logger";

const logger = new Logger("plugins.chipi.filter.bucketFilter");

const prefixedKey = "bucket";

// shortcut values can help user to use the filter quickly
const shortcutKeys = [];

/**
 * Get filter item by filter key, bucket name
 * @param {String} key
 * @param {String} bucketName The bucket name
 *
 */
const _getFilterItem = (key, bucketName) => {
  return {
    label: `:${key}:${bucketName ? bucketName + " " : ""}`,
    description: `search by bucket`,
    type: `bucket`,
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

  const bucketSearchTerm = searchPath[1];

  // Return the filter key only if the search path only has first part
  if (!bucketSearchTerm && bucketSearchTerm != "") {
    return [_getFilterItem(prefixedKey)];
  }

  logger.verbose("Bucket search term", { bucketSearchTerm });

  return chipiUserData.instance.findBuckets(bucketSearchTerm).then(buckets => {
    return buckets
      .map(bucket => {
        return _getFilterItem(prefixedKey, bucket.name);
      })
      .filter(Boolean);
  });
};

export default {
  findAutoCompleteItemsAsync,
  prefixedKeys: [prefixedKey],
  shortcutKeys
};
