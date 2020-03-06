import Logger from "@app/lib/logger";
import { chipiAnalytics } from "@app/lib/chipi";
import { IMagicFilterState, IMagicFilterActionTypes } from "./types";

import {
  UPDATE_TERM,
  RESET,
  PLUGIN_SUGGESTION_STARTED,
  SHOW_MAGIC_FILTER_SUGGESTION,
  HIDE_MAGIC_FILTER_SUGGESTION,
  HIGHLIGHT_MAGIC_FILTER_SUGGESTION_ITEM,
  ADD_MAGIC_FILTER
} from "@app/main/constants/actionTypes";

const logger = new Logger("reducer.magicFilter");

const initialState: IMagicFilterState = {
  searchId: "",
  magicFilterSuggestion: undefined,
  highlightedSuggestionIndex: -1
};

export function magicFilterReducer(
  state = JSON.parse(JSON.stringify(initialState)),
  action: IMagicFilterActionTypes
): IMagicFilterState {
  switch (action.type) {
    case UPDATE_TERM: {
      return {
        ...state,
        term: action.payload,
        magicFilterSuggestion: null,
        highlightedSuggestionIndex: -1
      };
    }
    case PLUGIN_SUGGESTION_STARTED: {
      const { searchId } = action.payload;

      return {
        ...state,
        searchId: searchId
      };
    }
    case SHOW_MAGIC_FILTER_SUGGESTION: {
      const { magicFilterSuggestion, searchId } = action.payload;

      if (searchId !== state.searchId) {
        // Do not show this suggestion if search id was changed
        return state;
      }

      if (
        !magicFilterSuggestion ||
        !magicFilterSuggestion.items ||
        magicFilterSuggestion.items.length == 0 ||
        // We don't want to display the magic filter if the it only has one item and this item label is same to the match term
        (magicFilterSuggestion.items.length == 1 &&
          magicFilterSuggestion.items[0].match.matchTerm ==
            magicFilterSuggestion.items[0].label.trim())
      ) {
        return {
          ...state,
          magicFilterSuggestion: null,
          highlightedSuggestionIndex: -1
        };
      }

      return {
        ...state,
        magicFilterSuggestion
      };
    }
    case HIDE_MAGIC_FILTER_SUGGESTION: {
      return {
        // Do not override last used search term with empty string
        ...state,

        magicFilterSuggestion: null,
        searchId: "",
        highlightedSuggestionIndex: -1
      };
    }
    case HIGHLIGHT_MAGIC_FILTER_SUGGESTION_ITEM: {
      const { highlightedSuggestionIndex } = action.payload;

      return {
        ...state,
        highlightedSuggestionIndex
      };
    }
    case RESET: {
      return {
        // Do not override last used search term with empty string
        ...state,

        magicFilterSuggestion: null,
        searchId: "",
        highlightedSuggestionIndex: -1
      };
    }
    case ADD_MAGIC_FILTER: {
      const { magicFilter } = action.payload;
      chipiAnalytics.addNewEvent("keyboard.addMagicFilter", { magicFilter });

      return {
        // Do not override last used search term with empty string
        ...state,

        magicFilterSuggestion: null,
        searchId: "",
        highlightedSuggestionIndex: -1
      };
    }
    default:
      return state;
  }
}
