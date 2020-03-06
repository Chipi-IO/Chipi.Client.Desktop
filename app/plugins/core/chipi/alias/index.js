"use strict";

import Logger from "../../../../lib/logger";
import { chipiMagicFilterHelper } from "../../../../lib/chipi";
import S from "string";
import chipiLogo from "../../../../resources/chipi.png";
import { chipiUserData } from "../../../../lib/chipi";
import chipiAuth from "../../../../lib/chipi/auth";

S.extendPrototype();

const _logger = new Logger("plugins.chipi.alias");

const _aliasesStoreKey = "chipi-alias";
const _aliasIndicator = "/";
const _commandArgumentPrefix = "-";

// Available aliases
// { "aliasKey" : { value: "aliasValue" } }
let _availableAliases = {};
let _currentLoadedUserName;

/**
 * Get values for the alias command
 * @param {String} searchTerm
 * @param {String} aliasKey
 * @param {String} commandkey
 */
const _getAliasCommandValue = (searchTerm, aliasKey, commandkey) => {
  return searchTerm
    .replace(`${_getAliasTerm(aliasKey)}`, "")
    .replace(`${_commandArgumentPrefix}${commandkey}`, "")
    .trim()
    .split(" ")
    .join(" ");
};

/**
 * Construct the alias term from alias key
 * @param {*} aliasKey
 */
const _getAliasTerm = aliasKey => {
  return `${_aliasIndicator}${aliasKey}`;
};

/**
 * Once value being saved into the alias, update the result item to give feedback back to user
 * @param {Object} resultItem
 * @param {String} aliasKey
 * @param {Function} onResultItemUpdated
 */
const _onValueSaved = (resultItem, aliasKey, onResultItemUpdated) => {
  resultItem.title = "Saved!";
  resultItem.subtitle = `New value: ${_availableAliases[aliasKey].value}`;

  resultItem.onSelect = event => {
    event.preventDefault();
    return;
  };

  onResultItemUpdated(resultItem);
};

/** Pre-defined commands for the alias */
const _defaultCommands = {
  l: {
    description: "list vlaue from the alias",
    searchFn: (aliasKey, searchTerm) => {
      return {
        id: `alias.${aliasKey}.l`,
        title:
          (_availableAliases[aliasKey] && _availableAliases[aliasKey].value) ||
          `No value found for ${aliasKey}`,
        icon: chipiLogo,
        subtitle: searchTerm,
        //timestamp: searchTerm,
        onSelect: () => {
          return;
        }
      };
    }
  },
  a: {
    description: "add value to the alias",
    searchFn: (aliasKey, searchTerm, onResultItemUpdated) => {
      const commandValue = _getAliasCommandValue(searchTerm, aliasKey, "a");
      const resultItem = {
        id: `alias.${aliasKey}.a`,
        title: (
          <div>
            Add <strong>{commandValue || "{value such as :from:someone}"}</strong> to{" "}
            <strong>{_getAliasTerm(aliasKey)}</strong> [Press Enter to Save]
          </div>
        ),
        icon: chipiLogo,
        subtitle: searchTerm
        //timestamp: searchTerm,
      };

      resultItem.onSelect = event => {
        _addValueToAlias(aliasKey, commandValue);

        _onValueSaved(resultItem, aliasKey, onResultItemUpdated);

        event.preventDefault();
        return;
      };

      return resultItem;
    }
  },
  /*u: {
    description: "update value of the alias",
    searchFn: aliasKey => {},
    triggerFn: aliasKey => {}
  },*/
  r: {
    description: "remove value from the alias",
    searchFn: (aliasKey, searchTerm, onResultItemUpdated) => {
      const commandValue = _getAliasCommandValue(searchTerm, aliasKey, "r");
      const resultItem = {
        id: `alias.${aliasKey}.r`,
        title: (
          <div>
            Remove <strong>{commandValue || "{value such as :from:someone}"}</strong> from{" "}
            <strong>{_getAliasTerm(aliasKey)}</strong>
          </div>
        ),
        icon: chipiLogo,
        subtitle: searchTerm
        //timestamp: searchTerm,
      };

      resultItem.onSelect = event => {
        _removeValueFromAlias(aliasKey, commandValue);

        _onValueSaved(resultItem, aliasKey, onResultItemUpdated);

        event.preventDefault();
        return;
      };

      return resultItem;
    }
  },
  c: {
    description: "clear value from the alias",
    searchFn: (aliasKey, searchTerm, onResultItemUpdated) => {
      const resultItem = {
        id: `alias.${aliasKey}.c`,
        title: (
          <div>
            Clear value from <strong>{_getAliasTerm(aliasKey)}</strong>
          </div>
        ),
        icon: chipiLogo,
        subtitle: searchTerm
        //timestamp: searchTerm,
      };

      resultItem.onSelect = event => {
        _clearValueFromAlias(aliasKey);

        _onValueSaved(resultItem, aliasKey, onResultItemUpdated);

        event.preventDefault();
        return;
      };

      return resultItem;
    }
  }
};

const _executions = {
  alias: {
    commands: {
      n: {
        description: "create new alias"
      },
      d: {
        description: "delete alias"
      }
    }
  },
  following: {
    descriptions: {
      l: "list",
      a: "add new value",
      u: "update value",
      r: "remove value",
      c: "clear"
    },
    commands: _defaultCommands
  },
  _default: {
    commands: _defaultCommands
  }
};

/**
 * One aliases loaded event
 */
const _onAliasesLoaded = userName => {
  // Set following to be a pre-defined alias
  if (!_availableAliases.following) {
    _availableAliases.following = {
      value: ""
    };
  }

  // Register all the keys from aliases for term highlighting
  Object.keys(_availableAliases).map(aliasKey => {
    // Register all alias' keys to help the maininput to highlight the inline terms
    chipiMagicFilterHelper.registerPrefix(`${_getAliasTerm(aliasKey)}`);
  });

  _currentLoadedUserName = userName;
  _logger.verbose("Load aliases succeed");
};

/**
 * Load available aliases from the local storage
 */
const _loadAvailableAliases = async () => {
  try {
    if (!chipiUserData.instance) {
      throw new Error("Chipi user data store is ready yet");
    }

    const authState = chipiAuth.instance.getAuthState();

    if (authState.userName === _currentLoadedUserName) {
      return;
    }

    let aliases = await chipiUserData.instance.getSetting(_aliasesStoreKey);

    if (!aliases) {
      aliases = localStorage.getItem(_aliasesStoreKey) || "{}";

      // Migrating the aliases from local storage to the localDb.
      // TODO: remove this once everyone moved to version 0.7
      await chipiUserData.instance.setSetting(_aliasesStoreKey, aliases);
    }

    _availableAliases = JSON.parse(aliases);

    // Key alias is the special one, it appears all the time
    /*_availableAliases.alias = {
      description: "manage my aliases"
    };*/

    _onAliasesLoaded(authState.userName);
  } catch (err) {
    _logger.warn("Load aliases failed, going to schedule another one in few seconds", { err });
    setTimeout(_loadAvailableAliases, 3000);
  }
};

/**
 * Save aliases back to local storage
 */
const _saveAliases = () => {
  chipiUserData.instance &&
    chipiUserData.instance.setSetting(_aliasesStoreKey, JSON.stringify(_availableAliases));
};

/**
 * Add value to alias
 * @param {String} aliasKey
 * @param {String} value
 */
const _addValueToAlias = (aliasKey, value) => {
  if (!_availableAliases[aliasKey]) {
    return false;
  }

  if (!Array.isArray(value)) {
    value = value.split(" ");
  }

  const existingValue = _availableAliases[aliasKey].value
    ? _availableAliases[aliasKey].value.split(" ")
    : [];

  _availableAliases[aliasKey].value = new Set(existingValue.concat(value)).toArray().join(" ");

  _saveAliases();
  _loadAvailableAliases();

  return true;
};

/**
 * Remove value to alias
 * @param {String} aliasKey
 * @param {String} value
 */
const _removeValueFromAlias = (aliasKey, value) => {
  if (!_availableAliases[aliasKey]) {
    return false;
  }

  if (!Array.isArray(value)) {
    value = value.split(" ");
  }

  const existingValue = _availableAliases[aliasKey].value
    ? _availableAliases[aliasKey].value.split(" ")
    : [];

  const newValue = existingValue.filter(el => !value.includes(el)).join(" ");
  _availableAliases[aliasKey].value = newValue;

  _saveAliases();
  _loadAvailableAliases();

  return true;
};

/**
 * Clear value from an alias
 * @param {String} aliasKey
 */
const _clearValueFromAlias = aliasKey => {
  if (!_availableAliases[aliasKey]) {
    return false;
  }

  delete _availableAliases[aliasKey].value;
  _saveAliases();
  _loadAvailableAliases();

  return true;
};

/**
 * Get filter item by filter key and time string
 * @param {String} key
 * @param {String} commandKey
 */
const _getFilterItem = (key, commandKey, description = ``) => {
  return {
    label: `${_getAliasTerm(key)}${commandKey ? ` ${_commandArgumentPrefix}${commandKey} ` : " "}`,
    description,
    type: `alias`,
    supportAutoFill: false
  };
};

/**
 *
 * @param {*} term
 */
const _lookupMatchedAliases = term => {
  if (!term.startsWith(_aliasIndicator)) return;

  const _termSegments = term.stripLeft(_aliasIndicator).split(" ");
  const testingKey = _termSegments[0];
  const testingCommandArgument = _termSegments[1];

  const matchingAliasKeys = Object.keys(_availableAliases)
    .map(aliasKey => {
      if (
        testingKey == "" ||
        (aliasKey.startsWith(testingKey) && testingKey.length <= aliasKey.length)
      ) {
        return aliasKey;
      }
    })
    .filter(Boolean);

  const lookingForCommands = matchingAliasKeys.length == 1;

  const matchedAliases = matchingAliasKeys.map(aliasKey => {
    const alias = {
      key: aliasKey,
      description: _availableAliases[aliasKey] ? _availableAliases[aliasKey].description : ""
    };

    if (!lookingForCommands) return alias;

    // Get all available commands from the alias
    const availableCommands =
      (_executions[aliasKey] && _executions[aliasKey].commands) || _executions._default.commands;

    // Only match the possible commands by certian conditions
    let possibleCommands = {};

    Object.keys(availableCommands).forEach(commandKey => {
      const commandArgumentTerm = `${_commandArgumentPrefix}${commandKey}`;

      if (
        testingCommandArgument == undefined || // User are looking for the autocomplete values
        (testingCommandArgument != "" && commandArgumentTerm.startsWith(testingCommandArgument)) // User are not executing the alias and the provided command argument matches the user provided command argument
      ) {
        possibleCommands[commandKey] = availableCommands[commandKey];
      }
    });

    // Override the descriptions from a particular alias set
    if (_executions[aliasKey].descriptions && Object.keys(possibleCommands).length > 0) {
      Object.keys(possibleCommands).forEach(commandKey => {
        possibleCommands[commandKey].description =
          (_executions[aliasKey] && _executions[aliasKey].descriptions[commandKey]) ||
          possibleCommands[commandKey].description;
      });
    }

    alias.commands = possibleCommands;
    return alias;
  });

  return matchedAliases;
};

/**
 * Find magic filter suggestions
 * @param {Array} searchPath The segments of the search term provided by user
 */
const findMagicFilterItemsAsync = async (term, cursorPosition) => {
  await _loadAvailableAliases();

  const matchedAliases = _lookupMatchedAliases(term);

  if (!matchedAliases) {
    return Promise.resolve();
  }

  return Promise.resolve(
    matchedAliases
      .map(alias => {
        const aliasFilterItem = _getFilterItem(alias.key, "", alias.description);

        const commandsFilterItems =
          (alias.commands &&
            Object.keys(alias.commands).map(commandKey => {
              return _getFilterItem(alias.key, commandKey, alias.commands[commandKey].description);
            })) ||
          [];

        return [aliasFilterItem].concat(commandsFilterItems).map(filterIterm => {
          if (term.length >= filterIterm.label.length) return; // We only want to display autocomplete item when the length of the term is less than the autocomplete item label's length

          filterIterm.match = {
            matchIndex: 0,
            matchTerm: term,
            term
          };
          return filterIterm;
        });
      })
      .filter(Boolean)
      .flat()
  );
};

/**
 * Process potential alias command
 * @param {String} term Search term provided by user
 */
const processAliasAsync = async (term, display, onResultItemUpdated) => {
  if (!term) {
    return Promise.resolve();
  }

  await _loadAvailableAliases();

  const matchedAliases = _lookupMatchedAliases(term);

  // Only process alias if only one found
  if (!matchedAliases || matchedAliases.length != 1) {
    return Promise.resolve();
  }

  const matchedAlias = matchedAliases[0];

  // We don't want to execute multiple commands
  if (Object.keys(matchedAlias.commands).length == 1) {
    const executingCommand = Object.values(matchedAlias.commands)[0];

    if (executingCommand.searchFn) {
      const searchResult = executingCommand.searchFn(matchedAlias.key, term, onResultItemUpdated);
      display(searchResult);
    }
  }

  const aliasValue =
    (_availableAliases[matchedAlias.key] && _availableAliases[matchedAlias.key].value) || "";

  return {
    newTerm: term.replace(`${_getAliasTerm(matchedAlias.key)}`, aliasValue)
  };
  // Remove filter valud delimetor from the begining of the term
  const cleanedTerm = term.stripLeft(_aliasIndicator);

  return Promise.resolve();

  /*return Promise.all(
    aliases.map(alias => {
      if (alias.processAliasAsync) {
        return alias.processAliasAsync(cleanedTerm.split(" "), display);
      }

      return Promise.resolve();
    })
  );*/
};

// Load available aliases
_loadAvailableAliases();

export default {
  findMagicFilterItemsAsync,
  processAliasAsync
};
