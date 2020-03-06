import { chipiUserData } from "../../../../lib/chipi";
import Logger from "../../../../lib/logger";
import utils from "../../../../lib/utils";
import AvatarGroup from "../../../../main/components/Avatar/AvatarGroup";

const logger = new Logger("plugins.chipi.filter.personFilter");

const prefixedKeys = ["from", "to"];

/**
 * Get filter item by filter key and person name
 * @param {String} key
 * @param {String} personName
 * @param {Object} foundPersonGroup
 *
 */
const _getFilterItem = (key, personName, foundPersonGroup) => {
  //let label = personName;

  // Email is too long, we need to do some formatting
  //if (label && label.length > 30) {
  //  label =
  //    personName !== email ? personName.replace(/\(.*\)/, "").trim() : email.replace(/@.*/, "");
  //}

  if (personName) {
    personName = personName
      .replace(/'/g, "")
      .replace(/\"/g, "")
      .replace(/\s/g, "-");
  }

  let description = personName || `search by person`;

  if (foundPersonGroup) {
    let possiblePersons = [];
    Object.keys(foundPersonGroup).forEach(personGroupKey => {
      possiblePersons = possiblePersons.concat(foundPersonGroup[personGroupKey].persons || []);
    });

    let avatars = possiblePersons.map(person => {
      return {
        src: person.image,
        title: personName,
        tooltip: `${person.email || person.displayName} from ${person.fromChannel}`
      };
    });

    avatars = utils.removeDuplicates(avatars, "src");

    description = <AvatarGroup avatars={avatars} size={35} />;
  }

  return {
    label: `:${key}:${personName ? personName + " " : ""}`,
    type: `person`,
    supportAutoFill: true,
    description
  };
};

/**
 * Find auto complete items with user provide search path
 * @param {Array} searchPath Search path for filter to provide auto complete items
 */
const findAutoCompleteItemsAsync = async searchPath => {
  if (!searchPath || searchPath.length == 0) {
    return prefixedKeys.map(prefixedKey => {
      return _getFilterItem(prefixedKey);
    });
  }

  const matchedFilterKeyIndex = prefixedKeys.findIndex(prefixedKey => {
    return prefixedKey.startsWith(searchPath[0]);
  });

  if (matchedFilterKeyIndex == -1) {
    return;
  }

  const filterKey = prefixedKeys[matchedFilterKeyIndex];

  // Return the filter key only if the search path only has first part
  if (searchPath.length == 1) {
    return [_getFilterItem(filterKey)];
  }

  // If there is no search name, we will return suggested person
  if (searchPath[1].length == 0) {
    logger.verbose("No search name availabel for person filter", {
      searchPath
    });

    return chipiUserData.instance.listGeneralPersons("emailLower", 100).then(foundPersonGroups => {
      if (!foundPersonGroups) {
        return [_getFilterItem(filterKey)];
      }

      return Object.keys(foundPersonGroups)
        .map(normalizedName => {
          return _getFilterItem(filterKey, normalizedName, foundPersonGroups[normalizedName]);
        })
        .filter(Boolean)
        .slice(0, 20);
      /*
      return utils
        .removeDuplicates(
          foundPersons
            .map(person => {
              return _getFilterItem(filterKey, person.name, person.email);
            })
            .filter(Boolean),
          "label"
        )
        .slice(0, 10);*/
    });
  }

  logger.verbose("Person filter search name", { searchPath });
  return chipiUserData.instance
    .findGeneralPersonByName(searchPath[1].replace(/\-/g, " "))
    .then(foundPersonGroups => {
      if (!foundPersonGroups) {
        return;
      }
      return Object.keys(foundPersonGroups)
        .map(normalizedName => {
          return _getFilterItem(filterKey, normalizedName, foundPersonGroups[normalizedName]);
        })
        .filter(Boolean)
        .slice(0, 20);
      /*
      return utils.removeDuplicates(

        foundPersonGroups.map(person => {
          return _getFilterItem(filterKey, person.name, person.email);
        }),
        "label"
      );*/
    });
};

export default {
  findAutoCompleteItemsAsync,
  prefixedKeys
};
