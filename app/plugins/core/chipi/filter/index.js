"use strict";

import personFilter from "./personFilter";
import timeFilter from "./timeFilter";
import channelFilter from "./channelFilter";
import recentFilter from "./recentFilter";
import tagFilter from "./tagFilter";

import Logger from "../../../../lib/logger";
import { chipiMagicFilterHelper } from "../../../../lib/chipi";

import S from "string";

S.extendPrototype();

const logger = new Logger("plugins.chipi.filter");

const filters = [tagFilter, personFilter, channelFilter, timeFilter, recentFilter];
const filterValueDelimetor = ":";
let prefixedKeys = [];
let shortcutKeys = [];

filters.forEach(filter => {
  if (!filter.prefixedKeys) return;

  // Register all filters' prefixes to help the maininput to highlight the inline filtering term
  filter.prefixedKeys.forEach(prefixKey => {
    chipiMagicFilterHelper.registerPrefix(`${filterValueDelimetor}${prefixKey}`);
  });
  prefixedKeys = prefixedKeys.concat(filter.prefixedKeys);

  shortcutKeys = shortcutKeys.concat(filter.shortcutKeys || []);
});

/**
 * Find filter auto complete items by user search term
 * @param {String} term The search term provided by user
 * @param {cursor} cursorPosition The cursor position from the input
 */
const findMagicFilterItemsAsync = async (term, cursorPosition) => {
  // we should always check for the string that's before the cursor
  let stringToTest = term.substring(0, cursorPosition);

  // get the last string after the space if there is one
  const lastSpace = stringToTest.lastIndexOf(" ");
  if (lastSpace > -1) {
    const splitStringArray = stringToTest.split(" ");
    stringToTest = splitStringArray[splitStringArray.length - 1];
  }

  const filterTermSegments =
    stringToTest === ""
      ? []
      : stringToTest.stripLeft(filterValueDelimetor).split(filterValueDelimetor);

  // check if it matches any of the filters
  const isFilter = stringToTest
    ? prefixedKeys.some(filterKey => {
        return (
          //stringToTest.stripLeft(filterValueDelimetor).split(filterValueDelimetor)[0].startsWith(filterKey) ||
          filterKey.startsWith(filterTermSegments[0])
        );
      }) ||
      shortcutKeys.some(shortcutKey => {
        return shortcutKey == filterTermSegments[0].trim();
      })
    : false;

  // if it's not a filter resolve the promise
  if (!isFilter) {
    return Promise.resolve();
  }

  const matchTerm = stringToTest;
  const matchIndex = term.lastIndexOf(stringToTest, cursorPosition);

  logger.verbose("Filter pattern match", {
    term,
    stringToTest,
    cursorPosition
  });

  return Promise.all(
    filters.map(filter => {
      return (
        filter.findAutoCompleteItemsAsync &&
        filter.findAutoCompleteItemsAsync(filterTermSegments).then(items => {
          return (
            items &&
            items.map(item => {
              // Attach match property to each item
              return {
                ...item,
                match: {
                  matchIndex,
                  matchTerm,
                  term
                }
              };
            })
          );
        })
      );
    })
  );
};

export default {
  findMagicFilterItemsAsync
};
