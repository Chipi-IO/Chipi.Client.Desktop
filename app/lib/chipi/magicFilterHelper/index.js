"use strict";

const registeredPrefix = [];

/**
 * Test if the term matched any registered magic filter patterns
 * @param {*} term
 */
const isMagicFilter = term => {
  return registeredPrefix.some(prefix => {
    return term.startsWith(prefix);
  });
};

const registerPrefix = filterPrefix => {
  registeredPrefix.push(filterPrefix);
};

export default { registerPrefix, isMagicFilter };
