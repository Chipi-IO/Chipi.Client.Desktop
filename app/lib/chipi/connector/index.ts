import { CHIPI_APIS } from "Environment";
import chipiRequest from "../request";
import chipiAuth from "../auth";
import Logger from "../../logger";

let logger = new Logger("lib.chipi.connect");

export default class ConnectorService {
  static async fetchConnectsListAsync(authToken: any) {
    //const authToken = chipiAuth.instance.getAuthState().idToken;

    var fetchPreviewOptions = {
      url: `${CHIPI_APIS.connectorApiHost}/connect.list/`,
      raxConfig: {
        retry: 1,
        noResponseRetries: 1
      }
    };

    try {
      const connectListResponse = await chipiRequest.get(fetchPreviewOptions, authToken);

      if (connectListResponse.ok) return connectListResponse.payload;

      logger.warn("Fetching connect list was not ok", connectListResponse);

      return;
    } catch (err) {
      logger.error("Failed to fetch connect list", { err });

      return;
    }
  }

  /**
   *
   * @param {object} previewRequestOptions
   * {
   *  applicationId, { Application Id of the object }
   *  authorizedByAccount, { The authorized by account id who owns the object at original source }
   *  objectType, { The object type for the preview }
   *  objectId, { The object id }
   *  asThumbnail = true { Whether to retrieve the preview as thumbnail for original data based, the original data based preview may take long time to load }
   * }
   */
  static async fetchApplicationObjectPreviewAsync(previewProps: {
    applicationId: string;
    authorizedByAccount: string;
    objectType: string;
    objectId: string;
    asThumbnail?: Boolean;
  }) {
    const {
      applicationId,
      authorizedByAccount,
      objectType,
      objectId,
      asThumbnail = true
    } = previewProps;

    const authToken = chipiAuth.instance.getAuthState().idToken;
    var fetchPreviewOptions = {
      url: `${
        CHIPI_APIS.connectorApiHost
      }/application.objectPreview/${applicationId}/${authorizedByAccount}/${objectType}/${objectId}`,
      params: {
        asThumbnail
      },
      raxConfig: {
        retry: 1,
        noResponseRetries: 1
      }
    };

    try {
      const previewResponse = await chipiRequest.get(fetchPreviewOptions, authToken);

      if (previewResponse.ok) return previewResponse.payload;

      logger.warn("Fetching object preview was not ok", previewResponse);

      return;
    } catch (err) {
      logger.error("Failed to fetch object preview", { err });

      return;
    }
  }
}
