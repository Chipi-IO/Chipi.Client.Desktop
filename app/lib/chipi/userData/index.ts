import chipiSearch from "../search";
import chipiResource from "../resource";
import Logger from "../../../lib/logger";
import { isDev } from "Environment";
import debounce from "lodash/debounce";
import chipiAuth from "../auth";
import textHelper from "./textHelper";
import ConnectorService from "../connector";
import Dexie from "dexie";
import LocalDb from "./localDb";

const logger = new Logger("lib.chipi.userData");

export default class UserData {
  private _db!: LocalDb;
  private isPersonListCacheRefreshing = false;

  /**
   * The debounced refresh user person list cache call to avoid potential throttling call
   */
  private refreshUserPersonListCacheFromRemote = debounce(
    this.refreshUserPersonsListCacheAsync,
    1000,
    {
      leading: true,
      trailing: false
    }
  );

  private static _instance: UserData;

  static get instance(): UserData {
    if (!UserData._instance || !UserData._instance._db) {
      logger.verbose("Initializing the new user data instance");
      const newUserDataInstance = new UserData();
      const setupResult = newUserDataInstance._setup();

      if (setupResult) {
        UserData._instance = newUserDataInstance;
      }
    }

    return UserData._instance;
  }

  private constructor() {}

  /**
   * Setup user data store instance
   */
  private _setup() {
    const authState = chipiAuth.instance.getAuthState();

    if (!authState || !authState.isAuthenticated) {
      return false;
    }

    this._db = new LocalDb(authState.userName);
    return true;
  }

  /**
   * @typedef {Object} GeneralPerson
   * @property {String} email The unique email of the person
   * @property {String} name The shortest name appeared within different applications
   */

  private async getPersonByQueryPath(queryPath: any, queryValue: any) {
    if (!queryValue) return Promise.resolve();

    const personLookupPromise = this._db.persons
      .where(queryPath)
      .equals(queryValue)
      .first();

    if (!personLookupPromise) {
      return Promise.resolve();
    }

    return personLookupPromise.then(foundPerson => {
      logger.verbose("Cache returned person query request", { queryValue, foundPerson });

      if (foundPerson) {
        logger.verbose("Cache hit found person");
        return foundPerson;
      }

      logger.verbose("Cache miss hit for person");

      this.refreshUserPersonListCacheFromRemote();

      return Promise.resolve();
    });
  }

  /**
   * Refresh person list cache from user search store
   */
  private async refreshUserPersonsListCacheAsync() {
    logger.verbose("Cache is under refreshing?", {
      isPersonListCacheRefreshing: this.isPersonListCacheRefreshing
    });
    if (this.isPersonListCacheRefreshing) return Promise.resolve();

    this.isPersonListCacheRefreshing = true;

    logger.verbose("Start refreshing user person list cache");
    const authState = chipiAuth.instance.getAuthState();

    var userPersonListLatestFetchKey = `${authState.userName}.personListLatestFetchKey`;

    return this._db.settings
      .where("name")
      .equals(userPersonListLatestFetchKey)
      .first()
      .then(personListLatestFetch => {
        logger.verbose("Person list latest fetch setting returned", { personListLatestFetch });
        let fetchFrom = personListLatestFetch ? personListLatestFetch.value : -1;
        return chipiSearch
          .fetchPersonsListLiteAsync({
            authToken: authState.idToken,
            oldest: fetchFrom
          })
          .then((response: { results: any; latest: any }) => {
            const { results, latest } = response;
            logger.verbose("Returned persons for caching", {
              length: results.length
            });

            return Promise.all(
              results.map(async (person: any) => {
                // Normalize the person name and create the nameTerms for name searching
                const personName = person.name ? person.name.replace(/\([^)]*\)*/g, "") : "";
                const normalizedName = textHelper.normalize(personName);
                person.normalizedName = normalizedName || "";
                person.normalizedNameLower = normalizedName.toLowerCase();
                person.nameTermsLower = person.name
                  ? textHelper.getTermsForIndexing(personName.toLowerCase())
                  : [];
                person.emailLower = person.email ? person.email.toLowerCase() : null;

                return this._db
                  .transaction("rw", this._db.persons, () => {
                    return this._db.persons.put(person);
                  })
                  .catch(err => {
                    logger.error("There is an err while putting person into cache this._db", {
                      err,
                      person
                    });

                    throw err;
                  });
              })
            ).then(() => {
              var personListLatestFetchTimeStamp = latest;

              var personListLatestFetchTrackSetting = {
                name: userPersonListLatestFetchKey,
                value: personListLatestFetchTimeStamp
              };

              logger.verbose("Person list latest fetch track setting", {
                personListLatestFetchTrackSetting
              });
              return this._db.settings.put(personListLatestFetchTrackSetting);
            });
          });
      })
      .finally(() => {
        this.isPersonListCacheRefreshing = false;
      });
  }

  /**
   * Refresh channel list cache from user search store
   */
  private async refreshUserChannelsListCacheAsync() {
    const authState = chipiAuth.instance.getAuthState();

    var userChannelListLatestFetchKey = `${authState.userName}.channelListLatestFetchKey`;

    return this._db.settings
      .where("name")
      .equals(userChannelListLatestFetchKey)
      .first()
      .then(channelListLatestFetch => {
        let fetchFrom = channelListLatestFetch ? channelListLatestFetch.value : -1;
        return chipiSearch
          .fetchChannelsListLiteAsync({
            authToken: authState.idToken,
            oldest: fetchFrom
          })
          .then((response: { results: any; latest: any }) => {
            const { results, latest } = response;

            logger.verbose("Returned channels for caching", {
              length: results.length
            });

            return Promise.all(
              results.map(async (channel: any) => {
                return this._db
                  .transaction("rw", this._db.channels, () => {
                    return this._db.channels.put(channel);
                  })
                  .catch(err => {
                    logger.error("There is an err while putting channel into cache this._db", {
                      err,
                      channel
                    });

                    throw err;
                  });
              })
            ).then(() => {
              const channelListLatestFetchTimeStamp = latest;

              var channelListLatestFetchTrackSetting = {
                name: userChannelListLatestFetchKey,
                value: channelListLatestFetchTimeStamp
              };

              logger.verbose("Channel list latest fetch track setting", {
                channelListLatestFetchTrackSetting
              });
              return this._db.settings.put(channelListLatestFetchTrackSetting);
            });
          });
      });
  }

  /**
   * Refresh user's Tunnels list into cache
   */
  refreshUserTunnelsListCacheAsync = async () => {
    const authState = chipiAuth.instance.getAuthState();

    var userTunnelsListLatestFetchKey = `tunnelsListLatestFetchKey`;

    return this._db.settings
      .where("name")
      .equals(userTunnelsListLatestFetchKey)
      .first()
      .then(tunnelsListLatestFetch => {
        let fetchFrom = tunnelsListLatestFetch ? tunnelsListLatestFetch.value : -1;

        return chipiSearch
          .fetchTunnelsListLiteAsync({
            authToken: authState.idToken,
            oldest: fetchFrom
          })
          .then((response: { results: any; latest: any }) => {
            const { results, latest } = response;
            logger.verbose("Returned tunnels for caching", {
              length: results.length
            });

            return Promise.all(
              results.map(async (tunnel: any) => {
                return this._db
                  .transaction("rw", this._db.tunnels, () => {
                    return this._db.tunnels.put(tunnel);
                  })
                  .catch(err => {
                    logger.error("There is an err while putting tunnel into cache this._db", {
                      err,
                      tunnel
                    });

                    throw err;
                  });
              })
            ).then(() => {
              const tunnelsListLatestFetchTimeStamp = latest;

              var tunnelsListLatestFetchTrackSetting = {
                name: userTunnelsListLatestFetchKey,
                value: tunnelsListLatestFetchTimeStamp
              };

              logger.verbose("Tunnl list latest fetch track setting", {
                tunnelsListLatestFetchTrackSetting
              });
              return this._db.settings.put(tunnelsListLatestFetchTrackSetting);
            });
          });
      });
  };

  /**
   * Refresh users' Tags list into cache
   */
  private async refreshTagsListCacheAsync() {
    const authState = chipiAuth.instance.getAuthState();

    const userTagsListLatestFetchKey = `tagsListLatestFetchKey`;

    return this._db.settings
      .where("name")
      .equals(userTagsListLatestFetchKey)
      .first()
      .then(tagsListLatestFetch => {
        let fetchFrom = tagsListLatestFetch ? tagsListLatestFetch.value : -1;

        return chipiResource
          .fetchTagsListAsync({
            authToken: authState.idToken,
            after: fetchFrom
          })
          .then(({ results, latest }) => {
            logger.verbose("Returned tags for caching", {
              length: results.length
            });

            return Promise.all(
              results.map(async (tag: any) => {
                return this._db
                  .transaction("rw", this._db.tags, () => {
                    return this._db.tags.put(tag);
                  })
                  .catch(err => {
                    logger.error("There is an err while putting tag into cache this._db", {
                      err,
                      tag
                    });

                    throw err;
                  });
              })
            ).then(() => {
              const tagsListLatestFetchTimeStamp = latest;

              var tagsListLatestFetchTrackSetting = {
                name: userTagsListLatestFetchKey,
                value: tagsListLatestFetchTimeStamp
              };

              logger.verbose("Tag list latest fetch track setting", {
                tagsListLatestFetchTrackSetting
              });
              return this._db.settings.put(tagsListLatestFetchTrackSetting);
            });
          });
      });
  }

  private async refreshConnectsListCacheAsync() {
    const authState = chipiAuth.instance.getAuthState();

    try {
      const connects = await ConnectorService.fetchConnectsListAsync(authState.idToken);

      await this._db.connects.clear();

      connects.map(async (connect: any) => {
        await this._db.connects.put(connect);
      });
    } catch (err) {
      logger.error("There is an error while refreshing the connects list cache", { err });
      return;
    }
  }

  dispose() {
    logger.verbose("Disposing the user data instance", { dbName: this._db.name });
    if (this._db) {
      this._db.close();
      this._db = null;
    }

    UserData._instance = null;
  }

  /**
   * Refresh cache data
   */
  async refreshCache() {
    await Promise.all([
      this.refreshUserChannelsListCacheAsync(),
      this.refreshUserPersonsListCacheAsync(),
      //refreshUserTunnelsListCacheAsync();
      this.refreshTagsListCacheAsync(),
      this.refreshConnectsListCacheAsync()
    ]);
  }

  async getPersonByRawIdentityId(idValue: string) {
    return this.getPersonByQueryPath("rawIdentity.id", idValue);
  }

  async getPersonById(idValue: string) {
    return this.getPersonByQueryPath("id", idValue);
  }

  /**
   * Find person from cached storage by name
   * @param {String} searchName Name to find the person
   * @return {Promis<GeneralPerson>} The person used for general displaying purpose
   */
  async findGeneralPersonByName(searchName: string, limit: number = 100) {
    logger.verbose("Start searching general person by name", { searchName });

    const personQuery =
      searchName.indexOf(" ") > -1
        ? this._db.persons.where("normalizedNameLower").startsWith(searchName.toLowerCase())
        : this._db.persons
            .where("emailLower")
            .startsWith(searchName.toLowerCase())
            .or("nameTermsLower")
            .startsWith(searchName.toLowerCase());

    return personQuery
      .limit(limit)
      .toArray()
      .then(matchedPersons => {
        logger.verbose("Matched general person", { matchedPersons });

        return this.convertToPersonGroups(matchedPersons);
      });
  }

  /**
   * List general person
   * @param {String} orderby The field of odering
   * @param {Number} limit Number of persons returned
   * @return {Promis<GeneralPerson>} The person used for general displaying purpose
   */
  listGeneralPersons = async (orderby = "emailLower", limit = 10) => {
    logger.verbose("Start listing general person", { orderby, limit });
    return this._db.persons
      .orderBy(orderby)
      .limit(limit)
      .toArray()
      .then(matchedPersons => {
        logger.verbose("Listed general persons", { matchedPersons });

        return this.convertToPersonGroups(matchedPersons);
      });
  };

  listConnects = async () => {
    return this._db.connects.toArray();
  };

  /**
   * List channel groups based on fromChannel
   * @param {*} orderby
   * @param {*} limit
   */
  listFromChannelGroups = async (orderby = "fromChannel", limit = 10) => {
    logger.verbose("Start listing general channels", { orderby, limit });
    return this._db.channels
      .orderBy(orderby)
      .limit(limit)
      .toArray()
      .then(channels => {
        logger.verbose("Listed general channels", { channels });

        const channelGroups: any = {};

        channels.forEach(channel => {
          if (!channelGroups[channel.fromChannel]) channelGroups[channel.fromChannel] = 0;

          channelGroups[channel.fromChannel] = channelGroups[channel.fromChannel] + 1;
        });

        return channelGroups;
      });
  };

  /**
   * Find channels with provided fromChannelGroup and searchTerm
   * @param {*} fromChannelGroup The channel group to be searched with such as slack, gdrive
   * @param {*} searchTerm The actual channel term to be searched against the filterable term
   * @param {*} orderby
   * @param {*} limit
   */
  async findGeneralChannel(
    fromChannelGroup: string,
    searchTerm: string,
    orderby: string = "filterableTerm",
    limit: number = 10
  ) {
    return this._db.channels
      .where("fromChannel")
      .startsWith(fromChannelGroup)
      .limit(limit)
      .toArray()
      .then(channels => {
        logger.verbose("Found general channels", { channels });

        return channels
          .map(channel => {
            return channel.filterableTerm.startsWith(searchTerm) && channel;
          })
          .filter(Boolean);
      });
  }

  /**
   * Find buckets
   * @param {*} searchTerm
   * @param {*} orderby
   * @param {*} limit
   */
  async stfindBuckets(searchTerm: string, orderby: string = "name", limit: number = 10) {
    return this._db.tunnels
      .where("rawType")
      .equals("chipi.bucket")
      .toArray()
      .then(tunnels => {
        logger.verbose("Found tunnels", { tunnels });

        return tunnels
          .map(tunnel => {
            if (!searchTerm || tunnel.name.startsWith(searchTerm)) {
              return tunnel;
            }
          })
          .filter(Boolean)
          .sort((a, b) => (a.name > b.name ? 1 : -1));
      });
  }

  /**
   * Find tags
   * @param {*} searchTerm
   * @param {*} orderby
   * @param {*} limit
   */
  async findTags(searchTerm: string, orderby = "tagName", limit = 10) {
    return this._db.tags.toArray().then(tags => {
      logger.verbose("Found tag", { tags });

      return tags
        .map(tag => {
          if (!searchTerm || tag.tagName.startsWith(searchTerm)) {
            return tag;
          }
        })
        .filter(Boolean)
        .sort((a, b) => (a.tagName > b.tagName ? 1 : -1));
    });
  }

  /**
   * Convert the persons records to general persons for filtering purpose
   * @param {*} matchedPersons
   */
  private convertToPersonGroups(matchedPersons: any[]) {
    if (!matchedPersons || matchedPersons.length == 0) {
      return [];
    }
    // Matched item properties {nameTerms, email, fromChannel, personId, normalizedName, image }
    // Use email and normalized name to group found items

    // 1. Group persons by filterable value, since one email address within different channels and accounts may end up with different name. First step is to find out these persons and give them one uniformed name.
    const filterableValueGroups: any = {};

    matchedPersons.forEach(person => {
      // If the personName and email are same and the length is longer than 50, then we believe it's a robot account
      if (person.email && person.email == person.displayName && person.email.length >= 50) return;

      const personFilterableValue = person.email
        ? this.normalizePersonEmail(person.email)
        : person.displayName.toLowerCase();

      if (!filterableValueGroups[personFilterableValue]) {
        filterableValueGroups[personFilterableValue] = {
          normalizedName: person.normalizedName.toLowerCase(),
          persons: [person]
        };

        return;
      }

      const filterableValueGroup = filterableValueGroups[personFilterableValue];

      if (
        !filterableValueGroup.normalizedName ||
        (person.normalizedName &&
          filterableValueGroup.normalizedName.length > person.normalizedName.length)
      ) {
        filterableValueGroup.normalizedName = person.normalizedName.toLowerCase();
      }

      filterableValueGroup.persons.push(person);
    });

    // 2. Group again with common normalized name. After the step above, we can try to group persons if they have the same normalized name
    const normalizedNameGroups: any = {};

    Object.keys(filterableValueGroups).map(filterableValue => {
      const filterableValueGroup = filterableValueGroups[filterableValue];
      const normalizedName = filterableValueGroup.normalizedName;

      if (!normalizedNameGroups[normalizedName]) {
        normalizedNameGroups[normalizedName] = {};
      }
      normalizedNameGroups[normalizedName][filterableValue] = filterableValueGroup;
    });

    return normalizedNameGroups;
  }

  /**
   * Normalize the person email by removing un-necessary parts
   * @param {String} email Can be email or can be display name
   */
  private normalizePersonEmail(email: string) {
    return email.replace(/\+.+@/, "@");
  }

  /**
   * Get the long lived setting from cache server
   * @param {*} settingName
   */
  async getSetting(settingName: string) {
    return this._db.settings
      .where("name")
      .equals(settingName)
      .first()
      .then(settingObject => {
        if (!settingObject) return;

        return settingObject.value;
      });
  }

  /**
   * Set the setting item for long lived cache data
   * @param {*} settingName
   * @param {*} value
   */
  async setSetting(settingName: string, value: any) {
    const newSettingObject = {
      name: settingName,
      value
    };

    return this._db.settings.put(newSettingObject);
  }
}

/*export default {
  getPersonByRawIdentityId,
  getPersonById,
  refreshCache,
  initCacheStore,
  findGeneralPersonByName,
  listGeneralPersons,
  listFromChannelGroups,
  findGeneralChannel,
  findTags,
  getSetting,
  setSetting
};*/
