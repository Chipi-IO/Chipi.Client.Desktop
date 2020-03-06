import Logger from "@app/lib/logger";
import uniq from "lodash/uniq";
import orderBy from "lodash/orderBy";
import { IOutputState, IOutputActionTypes } from "./types";

import {
  UPDATE_TERM,
  SHOW_RESULT,
  SHOW_SUGGESTION,
  RESET,
  PLUGIN_SEARCH_FINISHED,
  PLUGIN_SEARCH_STARTED,
  HIGHLIGHT_OUTPUT_ITEM,
  RESULT_ITEM_UPDATED
} from "@app/main/constants/actionTypes";

const logger = new Logger("reducer.output");

const initialState: IOutputState = {
  results: [],
  suggestions: [],
  visibleSuggestions: [],
  outputs: [],
  highlightedOutputItem: null,
  highlightedOutputIndex: -1,
  searchId: "",
  hasNoFoundItems: false,
  searchedTerm: "",
  updatedResultItem: null
};

function normalizeResult(result: any) {
  return {
    ...result,
    actions:
      result.actions ||
      (result.onSelect
        ? [
            {
              name: "Open",
              keys: "enter",
              fn: result.onSelect
            }
          ]
        : [])
  };
}

export function outputReducer(
  state = JSON.parse(JSON.stringify(initialState)),
  action: IOutputActionTypes
) {
  switch (action.type) {
    case UPDATE_TERM: {
      return {
        ...JSON.parse(JSON.stringify(initialState)),
        searchedTerm: action.payload
      };
    }
    case RESET: {
      return JSON.parse(JSON.stringify(initialState));
    }
    case PLUGIN_SEARCH_STARTED: {
      const { searchId } = action.payload;

      return {
        ...state,
        searchId: searchId
      };
    }
    case PLUGIN_SEARCH_FINISHED: {
      const { searchId, searchCounter } = action.payload;
      if (searchId !== state.searchId) {
        // Do not show this suggestion if term was changed
        return state;
      }

      const results = state.results || [];
      const suggestions = state.suggestions || [];

      // Visible suggestions will be empty if the results has less than 5 items;

      const visibleSuggestions = results.length > 5 ? suggestions : [];

      //const outputs = visibleSuggestions.concat(results);

      const outputs = results;
      const hasNoFoundItems = searchCounter > 0 && outputs.length === 0;

      return {
        ...state,
        outputs,
        visibleSuggestions,
        hasNoFoundItems
      };
    }
    case SHOW_RESULT: {
      const { results, searchId } = action.payload;
      let existingResults = state.results;

      if (searchId !== state.searchId) {
        // Do not show this result if term was changed
        return state;
      }

      results.forEach((result: any) => {
        existingResults.push(normalizeResult(result));
      });

      let newResults = orderBy(uniq(existingResults), (result: any) => result.order || 0);

      return {
        ...state,
        autoSearch: false,
        results: newResults,
        outputs: newResults
        //resultsById,
        //resultIds: orderBy(uniq(resultIds), id => resultsById[id].order || 0)
      };
    }
    case SHOW_SUGGESTION: {
      const { suggestions, searchId } = action.payload;

      if (searchId !== state.searchId) {
        // Do not show this suggestion if term was changed
        return state;
      }

      return {
        ...state,
        suggestions
      };
    }
    case HIGHLIGHT_OUTPUT_ITEM: {
      const { highlightedOutputIndex } = action.payload;

      const highlightedOutputItem = state.outputs && state.outputs[highlightedOutputIndex];

      if (highlightedOutputItem) {
        highlightedOutputItem.displayPosition = {
          resultIndex: highlightedOutputIndex - state.visibleSuggestions.length,
          outputIndex: highlightedOutputIndex
        };

        highlightedOutputItem.searchedTerm = state.searchedTerm || "";
      }

      return {
        ...state,
        highlightedOutputItem,
        highlightedOutputIndex
      };
    }
    case RESULT_ITEM_UPDATED: {
      const { updatedResultItem } = action.payload;

      const { outputs, results } = state;

      const normalizedNewResultItem = normalizeResult(updatedResultItem);

      const newResults = results.map((resultItem: any) => {
        return resultItem.id == normalizedNewResultItem.id ? normalizedNewResultItem : resultItem;
      });

      const newOutputs = outputs.map((outputItem: any) => {
        return outputItem.id == normalizedNewResultItem.id ? normalizedNewResultItem : outputItem;
      });

      return {
        ...state,
        results: newResults,
        outputs: newOutputs,
        updatedResultItem: normalizedNewResultItem
      };
    }
    default:
      return state;
  }
}
