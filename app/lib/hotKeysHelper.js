import List from "collections/list";
import Logger from "@app/lib/logger";

const logger = new Logger("comopenets.Chipi.hotkeysHelper");

/**
 * The test function to match the hotKeyItem against the id within the hotKeysCollection
 * @param {*} id
 * @param {*} hotKeyItem
 */
const _hotKeysMatchById = (hotKeyItem, id) => {
  return id.toLowerCase() === hotKeyItem.id.toLowerCase();
};

/**
 * Delete hotKey item from the hotKeys collection by id
 */
const _deleteHotKeys = (id, hotKeysCollection) => {
  logger.verbose("Start deleting hot keys from collection", { id });
  let deleted = hotKeysCollection.delete(id, _hotKeysMatchById);
  logger.verbose("Deleted hotKey items from collection", { id, deleted });
  return deleted;
};

/**
 * Register hotkeys
 * @param {String} id
 * @param {*} keyMap
 * @param {*} handlers
 */
const addHotKeys = (id, keyMap, handlers, hotKeysCollection) => {
  logger.verbose("Start registering the hotKeys", {
    id,
    keyMap,
    numberOfCollectionItems: hotKeysCollection.length
  });
  if (hotKeysCollection.has(id, _hotKeysMatchById)) {
    logger.debug("Hot keys component name already exists in the collection", { id });
    _deleteHotKeys(id, hotKeysCollection);
  }

  const registeringHotKeys = { id, keyMap, handlers };

  hotKeysCollection.add(registeringHotKeys);
  return hotKeysCollection;
};

/**
 * Deregister hotkeys, child components use this function to remove their registered hostkeys
 * TODO: Implement custom compont to manage the deregistration automatically
 * @param {*} id
 */
const deleteHotKeys = (id, hotKeysCollection) => {
  _deleteHotKeys(id, hotKeysCollection);
  return hotKeysCollection;
};

/**
 * Update hot keys stat value from the hot keys collection. The collection has to be FIFO like queue.
 */
const buildFinalHotKeys = (hotKeysCollection) => {
  let finalHotKeys = {};
  logger.verbose("Build final hot keys", { numberOfCollectionItems: hotKeysCollection.length });

  hotKeysCollection.forEach(hotKeysRegister => {
    logger.verbose("Found hot key register from hot keys collection", { id: hotKeysRegister.id });
    finalHotKeys.keyMap = Object.assign({}, finalHotKeys.keyMap, hotKeysRegister.keyMap);
    finalHotKeys.handlers = Object.assign({}, finalHotKeys.handlers, hotKeysRegister.handlers);
  });

  logger.verbose("HotKeys", { finalHotKeys, numberOfCollectionItems: hotKeysCollection.length  });

  return finalHotKeys;
};

export default {
  buildFinalHotKeys,
  addHotKeys,
  deleteHotKeys
};
