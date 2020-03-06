import plugins from "plugins";
import config from "lib/config";
import { shell, clipboard, remote, ipcRenderer } from "electron";
import { settings as pluginSettings } from "lib/plugins";
import Logger from "../../lib/logger";
import debounce from "lodash/debounce";
import { chipiAnalytics, chipiAuth } from "../../lib/chipi";
import { replace, push } from "connected-react-router";
import uuid from "uuid/v4";

import store, { history } from "../store";

import {
  UPDATE_TERM,
  SHOW_RESULT,
  RESET,
  SHOW_SUGGESTION,
  PLUGIN_SEARCH_STARTED,
  PLUGIN_SEARCH_FINISHED,
  OPEN_DETAILS_VIEW,
  SHOW_MAGIC_FILTER_SUGGESTION,
  RESULT_ITEM_UPDATED,
  PLUGIN_SUGGESTION_STARTED,
  PLUGIN_SEARCH_ENDED_WITH_ERROR,
  OPEN_FULL_THREAD
} from "../constants/actionTypes";

const logger = new Logger("actionsSearch");

/**
 * Default scope object would be first argument for plugins
 *
 * @type {Object}
 */
const DEFAULT_SCOPE = {
  config,
  actions: {
    open: q => {
      let externalLocation = q;

      /*if (q.startsWith("http")) {
        externalLocation = `${q}${q.indexOf("?") > -1 ? "&" : "?"}fromChipi=true`;
      }*/

      return shell.openExternal(externalLocation);
    },
    reveal: q => shell.showItemInFolder(q),
    copyToClipboard: q => clipboard.writeText(q),
    replaceTerm: term => store.dispatch(updateTerm(term)),
    hideWindow: () => remote.getCurrentWindow().hide(),
    signIn: () => {
      ipcRenderer.send("signIn");
    },
    signOut: () => {
      ipcRenderer.send("signOut");
    },
    openDetailsView: (triggeredByActionName, resultItem) => {
      _openDetailsView(triggeredByActionName, resultItem);
    },
    onResultItemUpdated: updatedResultItem => {
      _onResultItemUpdated(updatedResultItem);
    },
    openFullThread: resultItem => {
      _openFullThread(resultItem);
    }
  }
};

/**
 * Pass search term to all plugins and handle their autocomplete suggestion
 * @param {String} term Search term
 * @param {Integer} cursorPosition
 */
const _eachPluginSuggestion = debounce((term, cursorPosition) => {
  const suggestionId = Date.now();
  store.dispatch(_onPluginSuggestionStarted(suggestionId));

  Object.keys(plugins).forEach(name => {
    if (term.length === 0) {
      return;
    }

    const magicFilterSuggestionFn = plugins[name].magicFilterSuggestion;
    if (magicFilterSuggestionFn) {
      magicFilterSuggestionFn({
        term: term,
        cursorPosition,
        displayMagicFilterSuggestion: magicFilterSuggestion => {
          _onMagicFilterSuggestionFound(magicFilterSuggestion, suggestionId);
        }
      });
    }
  });
}, 0);

/**
 * Pass search term to all plugins and handle their results
 * @param {String} term Search term
 * @param {Integer} cursorPosition
 */
const _eachPluginSearch = debounce((term, cursorPosition) => {
  const searchId = Date.now();
  const authState = chipiAuth.getAuthState();
  store.dispatch(_onPluginSearchStarted(searchId));

  let searchTaskPromises = [];
  let searchCounter = 0;

  Object.keys(plugins).forEach(name => {
    if (term.length === 0) {
      return;
    }

    logger.verbose("Plugin start search", { name, term });

    const searchFn = plugins[name].fn;
    if (searchFn) {
      const searchTask = searchFn({
        ...DEFAULT_SCOPE,
        term: term,
        cursorPosition,
        //hide: id => store.dispatch(hideElement(`${name}-${id}`)),
        //update: (id, result) => store.dispatch(updateElement(`${name}-${id}`, result)),
        display: payload => {
          _mapSearchResults(payload, name, searchId);
        },
        settings: pluginSettings.getUserSettings(name),
        authState,
        dispatch: store.dispatch,
        displayFilter: payload => {},
        displaySuggestion: payload => {
          _mapSuggestionResults(term, payload, name, searchId);
        }
      });

      searchCounter++;

      const isSearchTaskPromise = searchTask && typeof searchTask.then === "function";
      if (isSearchTaskPromise) {
        searchTaskPromises.push(searchTask);
      }
    }
  });

  // Only send the analytics event at least one search plugin proceed the search query
  if (searchCounter > 0) {
    logger.verbose("Search task promises", { searchTaskPromises });
    chipiAnalytics.addNewEvent("search.searchTerm", {
      searchTerm: term
    });
  }

  Promise.all(searchTaskPromises)
    .then(() => {
      store.dispatch(_onPluginSearchFinished(searchId, searchCounter));
    })
    .catch(err => {
      store.dispatch(_onPluginSearchEndedWithErrors(err));
    });
}, 400);

/**
 * Handle suggestions found by plugin
 *
 * @param  {Array} suggestions Found suggestions
 * @return {Object}  redux action
 */
const _onSuggestionFound = (term, filters, suggestions, searchId) => {
  return {
    type: SHOW_SUGGESTION,
    payload: {
      term,
      filters,
      suggestions,
      searchId
    }
  };
};

/**
 * Preview contents
 */
const _openDetailsView = (triggeredByActionName, detailsItem) => {
  store.dispatch({
    type: OPEN_DETAILS_VIEW,
    payload: { triggeredByActionName, detailsItem }
  });
};

/**
 * Open full thread panel for the item
 */
const _openFullThread = resultItem => {
  store.dispatch({
    type: OPEN_FULL_THREAD,
    payload: {
      resultItem
    }
  });

  store.dispatch(push("/full-thread"));
};

/**
 * Called when all plugin search finished
 * @param {*} searchId The unique identifier for distingrish the each search run
 * @param {*} searchCounter Number of searched plugins
 */
const _onPluginSearchFinished = (searchId, searchCounter) => {
  logger.verbose("Plugin search finished function called");
  return {
    type: PLUGIN_SEARCH_FINISHED,
    payload: {
      searchId,
      searchCounter
    }
  };
};

/**
 * Called when all plugin search ended but with error
 * @param {*} error
 */
const _onPluginSearchEndedWithErrors = error => {
  return {
    type: PLUGIN_SEARCH_ENDED_WITH_ERROR,
    payload: {
      error
    }
  };
};

/**
 * Called when plugin search started
 * @param {*} searchId The unique identifier for distingrish the each search run
 */
const _onPluginSearchStarted = searchId => {
  logger.verbose("Plugin search started function called");

  return {
    type: PLUGIN_SEARCH_STARTED,
    payload: {
      searchId
    }
  };
};

/**
 * Called when plugin search started
 * @param {*} searchId The unique identifier for distingrish the each search run
 */
const _onPluginSuggestionStarted = searchId => {
  logger.verbose("Plugin suggestion started function called");

  return {
    type: PLUGIN_SUGGESTION_STARTED,
    payload: {
      searchId
    }
  };
};

/**
 * Handle results found by plugin
 *
 * @param  {String} term Search term that was used for found results
 * @param  {Array or Object} results Found results (or result)
 * @return {Object}  redux action
 */
const _onResultFound = (results, searchId) => {
  return {
    type: SHOW_RESULT,
    payload: {
      results,
      searchId
    }
  };
};

/**
 * Action that clears everthing in search box
 *
 * @return {Object}  redux action
 */
export function reset() {
  return {
    type: RESET
  };
}

/**
 *
 */
const _onMagicFilterSuggestionFound = (magicFilterSuggestion, searchId) => {
  logger.verbose("Magic filter collection mapping", { magicFilterSuggestion, searchId });

  store.dispatch({
    type: SHOW_MAGIC_FILTER_SUGGESTION,
    payload: {
      magicFilterSuggestion,
      searchId
    }
  });
};

const _mapSuggestionResults = (term, filters, payload, plugin, searchId) => {
  let suggestions = [];
  if (!payload || payload.length === 0) {
    return suggestions;
  }

  suggestions = Array.isArray(payload) ? payload : [payload];
  suggestions = suggestions.map(x => ({
    ...x,
    _type: "suggestion",
    plugin
  }));

  //logger.debug('[_mapSuggestionResults] suggestion results after mapping', suggestionResults);

  store.dispatch(_onSuggestionFound(term, filters, suggestions, searchId));
};

const _mapSearchResults = (payload, pluginName, searchId) => {
  if (!payload || payload.length === 0) {
    store.dispatch(_onResultFound([], searchId));
    return;
    //return [];
  }

  logger.verbose("Map search results payload", { pluginName, searchId });

  let results = Array.isArray(payload) ? payload.filter(Boolean) : [payload].filter(Boolean);
  results.forEach(r => {
    r.id = `${r.id || uuid()}`;
    r._type = "result";
    r.plugin = pluginName;
  });
  //return results;
  //logger.verbose('Map search results', { term, result })
  store.dispatch(_onResultFound(results, searchId));
};

/**
 * Output item can be updated externally
 * @param {*} updatedResultItem
 */
const _onResultItemUpdated = updatedResultItem => {
  store.dispatch({
    type: RESULT_ITEM_UPDATED,
    payload: {
      updatedResultItem
    }
  });
};

/**
 * Dispatch the UPDATE_TERM event
 * @param {String} term
 * @param {Integer} cursorPosition
 */
export const updateTerm = (term, cursorPosition) => {
  logger.verbose("Update term properties", { term, cursorPosition });

  return dispatch => {
    dispatch({
      type: UPDATE_TERM,
      payload: term
    });

    _eachPluginSuggestion(term, cursorPosition);
    _eachPluginSearch(term, cursorPosition);
  };
};