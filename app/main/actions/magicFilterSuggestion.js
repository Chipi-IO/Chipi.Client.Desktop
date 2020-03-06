import Logger from "../../lib/logger";

import {
  HIDE_MAGIC_FILTER_SUGGESTION,
  HIGHLIGHT_MAGIC_FILTER_SUGGESTION_ITEM,
  ADD_MAGIC_FILTER,
  SHOW_AUTOCOMPLETE
} from "../constants/actionTypes";

const logger = new Logger("actions.magicFilterSuggestion");

/**
 *
 */
export const hideMagicFilterSuggestion = () => {
  return {
    type: HIDE_MAGIC_FILTER_SUGGESTION
  };
};

export const highlightMagicFilterSuggestionItem = (
  highlightedSuggestionIndex,
  highlightedMagicFilter
) => {
  //const autocompleteValue = _getNewTermFromMagicFilter(match, highlightedMagicFilter);

  return dispatch => {
    dispatch({
      type: HIGHLIGHT_MAGIC_FILTER_SUGGESTION_ITEM,
      payload: { highlightedSuggestionIndex }
    });

    dispatch({
      type: SHOW_AUTOCOMPLETE,
      payload: {
        autocompleteValue: highlightedMagicFilter && highlightedMagicFilter.label,
        startIndex: highlightedMagicFilter.match.matchIndex,
        matchTerm: highlightedMagicFilter.match.matchTerm
      }
    });
  };
};

export const addMagicFilter = (magicFilter) => {
  //const newTerm = _getNewTermFromMagicFilter(match, magicFilter);

  return {
    type: ADD_MAGIC_FILTER,
    payload: {
      match: magicFilter.match,
      magicFilter
    }
  };
};
