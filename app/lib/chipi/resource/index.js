import chipiRequest from "../request";
import { CHIPI_APIS } from "Environment";
import Logger from "../../logger";
import chipiAuth from "../auth";

let logger = new Logger("lib.chipi.resourceApi");

/**
 * Fetch tags list from resource api and return list of lite tag objects
 * @param {*} param0
 */
const _fetchTagsListAsync = async ({ authToken, after, results = [] }) => {
  let latest = after;

  if (!results) results = [];

  return chipiRequest
    .get(
      {
        url: `${CHIPI_APIS.resourceApiHost}/tag.list`,
        params: {
          after
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

      results = response.payload;

      latest = Math.max.apply(
        Math,
        results.map(function(result) {
          return result.updatedAt;
        })
      );

      return {
        results,
        latest
      };
    });
};

export default {
  fetchTagsListAsync: _fetchTagsListAsync
};
