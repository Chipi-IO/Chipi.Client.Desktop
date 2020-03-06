import Logger from "../../../../lib/logger";
import engines from "./engines";

var logger = new Logger("plugins.chipi.rendering");

const prepareChipiSearchResultAsync = async ({
  searchResponsePayload,
  searchTerm,
  clientActions
}) => {
  //logger.verbose('Search hits payload', {searchResponsePayload});
  logger.info("Preparing Chipi search result", searchResponsePayload.took);

  if (!searchResponsePayload.hits || searchResponsePayload.hits.returned === 0) {
    logger.verbose("No results found from Chipi");
    return Promise.resolve([]);
  }

  logger.info(
    `Chipi search found ${searchResponsePayload.hits.total} results, returned ${
      searchResponsePayload.hits.foundItems.length
    } items`
  );

  //logger.debug(`Found items`, searchResponsePayload.hits.foundItems);

  const { foundItems, relatedItems } = searchResponsePayload.hits;

  // Create an index of relatedItems ids
  const additionalData = {};
  relatedItems &&
    relatedItems.forEach(item => {
      additionalData[item._id] = item._source;
    });

  return Promise.all(
    foundItems.map(async foundItem => {
      //logger.debug('Converting found Chipi object', foundItem._type);
      const searchResultItem = await toSearchResultFormatAync({
        foundItem,
        additionalData,
        searchTerm,
        clientActions
      });

      return searchResultItem;
    })
  );
};

const toSearchResultFormatAync = async ({
  foundItem,
  additionalData,
  searchTerm,
  clientActions
}) => {
  if (!foundItem) {
    logger.error("Found item is empty");
    return;
  }

  if (foundItem && !foundItem._source) {
    logger.error("Found item doesn't have _source field", { foundItem });
    return;
  }

  const itemType = foundItem._type;
  const fromChannel = foundItem._source.fromChannel;

  if (!engines[fromChannel]) {
    return;
  }

  return engines[fromChannel][itemType].toSearchResultFormat({
    foundItem,
    additionalData,
    searchTerm,
    actions: clientActions,
    clientActions
  });
};

export default {
  prepareChipiSearchResultAsync,
  toSearchResultFormatAync
};
