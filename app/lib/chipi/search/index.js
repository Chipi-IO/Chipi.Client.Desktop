import chipiRequest from "../request";
import { CHIPI_APIS } from "Environment";
import Logger from "../../logger";
import chipiAuth from "../auth";

let logger = new Logger("lib.chipi.searchApi");

const searchAllAsync = ({ term, filters }) => {
  const authState = chipiAuth.instance.getAuthState();

  return chipiRequest.post(
    {
      url: `${CHIPI_APIS.searchApiHost}/search.all`,
      data: {
        query: {
          terms: term.length > 0 ? [term] : undefined,
          filters
        }
      }
    },
    authState.idToken
  );
};

/**
 * Search message contents by thread
 * @param {*} threadId
 */
const searchThreadAsync = async threadId => {
  const authState = chipiAuth.instance.getAuthState();

  const response = await chipiRequest.post(
    {
      url: `${CHIPI_APIS.searchApiHost}/search.thread`,
      data: {
        threadId
      }
    },
    authState.idToken
  );

  return response;
};

const suggestGeneric = ({ term, filters }) => {
  const authState = chipiAuth.instance.getAuthState();

  return chipiRequest.post(
    {
      url: `${CHIPI_APIS.searchApiHost}/search.suggestion`,
      data: {
        query: {
          terms: term.length > 0 ? [term] : undefined,
          filters
        }
      }
    },
    authState.idToken
  );
};

/**
 * Fetch channel list from search store and return list of lite channel objects
 * @param {*} param0
 */
const fetchChannelsListLiteAsync = async ({
  authToken,
  cursor,
  size = 500,
  oldest = -1,
  results = []
}) => {
  let latest = oldest;

  if (!results) results = [];

  return chipiRequest
    .get(
      {
        url: `${CHIPI_APIS.searchApiHost}/channel.list`,
        params: {
          cursor,
          size,
          oldest
        }
      },
      authToken
    )
    .catch(err => {
      logger.error("Failed to fetch channel list", { err });
      throw new Error(err);
    })
    .then(response => {
      if (!response.ok) {
        if (response.error === "no_record")
          logger.verbose("fetchChannelsListLiteAsync request with no more records");
        else
          logger.error("fetchChannelsListLiteAsync failed to get more records with error", {
            response
          });
        return {
          results,
          latest
        };
      }

      if (response.payload.hits && response.payload.hits.foundItems)
        results = results.concat(
          response.payload.hits.foundItems.map(foundItem => {
            if (foundItem._source.systemUpdatedAt > latest) {
              latest = foundItem._source.systemUpdatedAt;
            }

            return {
              id: foundItem._id,
              filterableTerm: foundItem._source.filterableTerm,
              primaryName: foundItem._source.primaryName,
              secondaryName: foundItem._source.secondaryName,
              domain: foundItem._source.domain,
              fromChannel: foundItem._source.fromChannel,
              username: foundItem._source.userName
            };
          })
        );

      //logger.verbose('Ruslts after each fetch', { results });
      if (response.payload.meta && response.payload.meta.nextCursor)
        return fetchChannelsListLiteAsync({
          authToken,
          cursor: response.payload.meta.nextCursor,
          size,
          oldest,
          results
        });

      return {
        results,
        latest
      };
    });
};

/**
 * Fetch persons list from search api and return list of lite tunnel objects
 * @param {*} param0
 */
const fetchPersonsListLiteAsync = async ({
  authToken,
  cursor,
  size = 500,
  oldest = -1,
  results = []
}) => {
  //logger.verbose('Fetch person list lite request received', { authToken, cursor, size, oldest, results })
  let latest = oldest;

  if (!results) results = [];

  return chipiRequest
    .get(
      {
        url: `${CHIPI_APIS.searchApiHost}/person.list`,
        params: {
          cursor,
          size,
          oldest
        }
      },
      authToken
    )
    .catch(err => {
      logger.error("Failed to fetch person list", { err });
      throw new Error(err);
    })
    .then(response => {
      //logger.verbose('fetchPersonsListLiteAsync response', {response});
      if (!response.ok) {
        if (response.error === "no_record")
          logger.verbose("fetchPersonsListLiteAsync request with no more records");
        else
          logger.error("fetchPersonsListLiteAsync failed to get more records with error", {
            response
          });
        return {
          results,
          latest
        };
      }

      if (response.payload.hits && response.payload.hits.foundItems)
        results = results.concat(
          response.payload.hits.foundItems.map(foundItem => {
            if (foundItem._source.systemUpdatedAt > latest) {
              latest = foundItem._source.systemUpdatedAt;
            }

            return {
              id: foundItem._id,
              name: foundItem._source.name,
              displayName: foundItem._source.displayName,
              fromChannelId: foundItem._source.fromChannelId,
              fromChannel: foundItem._source.fromChannel,
              rawIdentity: foundItem._source.rawIdentity,
              systemUpdatedAt: foundItem._source.systemUpdatedAt,
              image: foundItem._source.image,
              email: foundItem._source.email,
              username: foundItem._source.userName
            };
          })
        );

      //logger.verbose('Ruslts after each fetch', { results });
      if (response.payload.meta && response.payload.meta.nextCursor)
        return fetchPersonsListLiteAsync({
          authToken,
          cursor: response.payload.meta.nextCursor,
          size,
          oldest,
          results
        });

      return {
        results,
        latest
      };
    });
};

/**
 * Fetch tunnels list from search api and return list of lite tunnel objects
 * @param {*} param0
 */
const fetchTunnelsListLiteAsync = async ({
  authToken,
  cursor,
  size = 500,
  oldest = -1,
  results = []
}) => {
  let latest = oldest;

  if (!results) results = [];

  return chipiRequest
    .get(
      {
        url: `${CHIPI_APIS.searchApiHost}/tunnel.list`,
        params: {
          cursor,
          size,
          oldest
        }
      },
      authToken
    )
    .catch(err => {
      logger.error("Failed to fetch tunnel list", { err });
      throw new Error(err);
    })
    .then(response => {
      //logger.verbose('fetchPersonsListLiteAsync response', {response});
      if (!response.ok) {
        if (response.error === "no_record")
          logger.verbose("fetchTunnelsListLiteAsync request with no more records");
        else
          logger.error("fetchTunnelsListLiteAsync failed to get more records with error", {
            response
          });
        return {
          results,
          latest
        };
      }

      if (response.payload.hits && response.payload.hits.foundItems)
        results = results.concat(
          response.payload.hits.foundItems.map(foundItem => {
            if (foundItem._source.systemUpdatedAt > latest) {
              latest = foundItem._source.systemUpdatedAt;
            }

            return {
              id: foundItem._id,
              name: foundItem._source.name,
              fromChannelId: foundItem._source.fromChannelId,
              fromChannel: foundItem._source.fromChannel,
              username: foundItem._source.userName,
              rawType: foundItem._source.rawType,
              createdAt: foundItem._source.createdAt,
              updatedAt: foundItem._source.updatedAt,
              systemUpdatedAt: foundItem._source.systemUpdatedAt
            };
          })
        );

      //logger.verbose('Ruslts after each fetch', { results });
      if (response.payload.meta && response.payload.meta.nextCursor)
        return fetchTunnelsListLiteAsync({
          authToken,
          cursor: response.payload.meta.nextCursor,
          size,
          oldest,
          results
        });

      return {
        results,
        latest
      };
    });
};

export default {
  searchAllAsync,
  suggestGeneric,
  fetchPersonsListLiteAsync,
  fetchChannelsListLiteAsync,
  fetchTunnelsListLiteAsync,
  searchThreadAsync
};
