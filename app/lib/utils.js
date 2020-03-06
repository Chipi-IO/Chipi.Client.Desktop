/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  var bHasOwnProperty = hasOwnProperty.bind(objB);
  for (var i = 0; i < keysA.length; i++) {
    if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}

const removeDuplicates = (inputArray, prop) => {
  return inputArray.filter((obj, pos, arr) => {
    return arr.map(mapObj => (mapObj[prop] || "").toLowerCase()).indexOf((obj[prop] || "").toLowerCase()) === pos;
  });
};

/**
 * Find item witin the array with the attribute value equals to the provided value 
 * @param {Array} inputArray 
 * @param {String} attr 
 * @param {*} value 
 */
const findItemByAttrValue = (inputArray, attr, value) => {
  const index = inputArray.findIndex(item => item[attr] === value);

  if (index == -1) {
    return;
  }
  return inputArray[index];
};

export default {
  shallowEqual,
  removeDuplicates,
  findItemByAttrValue
};
