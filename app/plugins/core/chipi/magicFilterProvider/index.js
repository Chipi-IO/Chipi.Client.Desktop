import Logger from "../../../../lib/logger";
import filter from "../filter";
import alias from "../alias";

const logger = new Logger("plugins.chipi.magicFilter");

/**
 * Find possible auto complete items for the term
 * @param {String} term The search term user entered
 * @param {Integer} cursorPosition The cursor position
 */
const findSuggestionByTerm = async (term, cursorPosition) => {
  // Filter search
  const filterSearchingPromise = filter.findMagicFilterItemsAsync(term, cursorPosition);

  // Alias search
  const aliasSearchingPromise = alias.findMagicFilterItemsAsync(term, cursorPosition);

  return Promise.all([filterSearchingPromise, aliasSearchingPromise])
    .then(magicFilterSearchResponses => {
      const filterSearchingResponse = magicFilterSearchResponses[0];
      const aliasSearchingResponse = magicFilterSearchResponses[1];

      logger.verbose("Magic filter searching responses", {
        filterSearchingResponse,
        aliasSearchingResponse
      });

      let autocompleteItems = [];

      filterSearchingResponse &&
        filterSearchingResponse.forEach(filterTypeGroupItems => {
          autocompleteItems = autocompleteItems.concat(filterTypeGroupItems);
        });

      aliasSearchingResponse &&
        aliasSearchingResponse.forEach(aliasTypeGroupItems => {
          autocompleteItems = autocompleteItems.concat(aliasTypeGroupItems);
        });

      return {
        items: autocompleteItems.filter(Boolean)
      }
    })
};

export default {
  findSuggestionByTerm
};
