/* eslint no-shadow: [2, { "allow": ["comments"] }] */
import Logger from "@app/lib/logger";
import { chipiAnalytics, chipiAuth } from "@app/lib/chipi";
import { ISearchState, ISearchActionTypes } from "./types";

import {
  UPDATE_TERM,
  RESET,
  PLUGIN_SEARCH_STARTED,
  PLUGIN_SEARCH_FINISHED,
  PLUGIN_SEARCH_ENDED_WITH_ERROR,
  ADD_MAGIC_FILTER,
  HIDE_MAGIC_FILTER_SUGGESTION,
  SHOW_AUTOCOMPLETE
} from "@app/main/constants/actionTypes";

const logger = new Logger("reducer.search");
const initialState: ISearchState = {
  // Search term in main input
  term: "",
  // Index of selected output item
  searchingInFlight: false,
  searchId: "",
  // Force to trigger search
  autoSearch: false,
  autocomplete: null, // { value, startIndex, matchTerm}
  error: null
};

export function searchReducer(
  state = JSON.parse(JSON.stringify(initialState)),
  action: ISearchActionTypes
): ISearchState {
  switch (action.type) {
    case UPDATE_TERM: {
      chipiAnalytics.addNewEvent("keyboard.updateTerm", { updateTerm: action.payload });

      return {
        ...state,
        autoSearch: false,
        term: action.payload,
        searchingInFlight: false,
        autocomplete: null
      };
    }
    case PLUGIN_SEARCH_ENDED_WITH_ERROR: {
      return {
        ...state,
        searchingInFlight: false,
        searchId: "",
        autoSearch: false,
        error: action.payload.error
      };
    }
    case ADD_MAGIC_FILTER: {
      const { match, magicFilter } = action.payload;

      const newTerm = _getNewTermFromMagicFilter(match, magicFilter, false);

      return {
        ...state,
        autoSearch: true,
        term: newTerm
      };
    }
    case SHOW_AUTOCOMPLETE: {
      const { autocompleteValue, startIndex, matchTerm } = action.payload;

      logger.verbose("Show autocomplete", { autocompleteValue, startIndex, matchTerm });

      if (
        !autocompleteValue ||
        !autocompleteValue.toLowerCase().startsWith(matchTerm.toLowerCase()) ||
        autocompleteValue.toLowerCase() == matchTerm.toLowerCase()
      ) {
        return {
          ...state,
          autocomplete: null
        };
      }

      const autocompletePaddingPart = autocompleteValue.substring(matchTerm.length);

      return {
        ...state,
        autocomplete: {
          value: `${matchTerm}${autocompletePaddingPart}`,
          paddingPart: autocompletePaddingPart,
          startIndex,
          matchTerm
        }
      };
    }

    case HIDE_MAGIC_FILTER_SUGGESTION: {
      return { ...state, autocomplete: null };
    }
    case PLUGIN_SEARCH_STARTED: {
      const { searchId } = action.payload;

      return {
        ...state,
        searchId: searchId,
        searchingInFlight: true
      };
    }
    case PLUGIN_SEARCH_FINISHED: {
      const { searchId } = action.payload;

      if (searchId !== state.searchId) {
        // Do not show this suggestion if search id was changed
        return state;
      }

      return {
        ...state,
        searchingInFlight: false,
        searchId: ""
      };
    }
    case RESET: {
      return {
        // Do not override last used search term with empty string
        ...state,
        term: "",
        searchId: "",
        highlightedOutputIndex: -1,
        searchingInFlight: false,
        autoSearch: true, // Prevent async results from being shown after clearing,
        autocomplete: null
      };
    }
    default:
      return state;
  }
}

/*
 * Get new search term based on provided magic filter
 * @param {*} magicFilterMatch
 * @param {*} magicFilter
 * @param {Boolean} forceUserInputCase
 */
const _getNewTermFromMagicFilter = (
  magicFilterMatch: any,
  magicFilter: any,
  forceUserInputCase = true
) => {
  if (!magicFilter) {
    return magicFilterMatch.term;
  }

  const term = magicFilterMatch.term;
  const matchTerm = magicFilterMatch.matchTerm;
  const matchIndex = magicFilterMatch.matchIndex;
  let filterTerm = magicFilter.label;

  logger.verbose("Getting new term from magic filter", { term, matchTerm, matchIndex });

  const termBeforeMatch = term.substring(0, matchIndex);
  const termAfterMatch = term.substring(matchIndex + matchTerm.length);

  logger.verbose("New term elements", { termBeforeMatch, filterTerm, termAfterMatch });

  if (forceUserInputCase) {
    // Make sure the match term within the autocompleteValue has the same case tot he user input
    const caseCorrectRegex = new RegExp(`${matchTerm}`, "gi");
    caseCorrectRegex.lastIndex = matchIndex;
    filterTerm = filterTerm.replace(caseCorrectRegex, matchTerm);
  }

  if (termAfterMatch.startsWith(" ") && filterTerm.endsWith(" ")) {
    filterTerm = filterTerm.trimEnd();
  }

  const newTerm = `${termBeforeMatch}${filterTerm}${termAfterMatch}`;

  return newTerm;
};
