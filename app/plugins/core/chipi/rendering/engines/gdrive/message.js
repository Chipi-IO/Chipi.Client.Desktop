import { shell, clipboard } from "electron";
import { icons } from "../../../images";
import S from "string";
import Logger from "../../../../../../lib/logger";
import { formatTimestamp } from "../../util";
import { chipiUserData, ChipiConnectorService } from "../../../../../../lib/chipi";
import Preview from "./Preview";
S.extendPrototype();

const logger = new Logger("plugin.chipi.rendering.engines.gdrive.message");

const googleAccountSwitchUrl = (continueUrl, accountEmail) => {
  let newUrl = continueUrl.indexOf("?") === -1 ? `${continueUrl}?` : `${continueUrl}&`;

  newUrl = `${newUrl}authuser=${accountEmail}`;

  logger.debug("New url for the drive item", { newUrl });

  return `https://accounts.google.com/AccountChooser?continue=${encodeURIComponent(
    newUrl
  )}&Email=${accountEmail}&service=mail`;
};

const normalizeMimeTypeName = mimeTypeName => {
  const fileNames = new Map([
    ["image/png", "PNG image"],
    ["image/jpeg", "JPEG image"],
    ["image/gif", "GIF image"],
    ["application/pdf", "PDF document"],
    ["document", "document"]
  ]);
  const normalized = mimeTypeName.replace("application/vnd.google-apps.", "");
  return fileNames.get(normalized) || normalized;
};

function toSearchResultFormat({ foundItem, additionalData, searchTerm = "+", actions }) {
  logger.debug("Start converting Chipi message object to display result");
  const data = foundItem._source;

  const openUrl = generateDriveOpenUrl(data, searchTerm);
  const presentationUrl = generateDrivePresentationUrl(data);

  const tunnelObject = additionalData[data.fromTunnelId];
  const showUrl = generateDriveShowUrl(tunnelObject, data, searchTerm);

  const channelObject = additionalData[data.fromChannelId] || {
    fromChannel: data.fromChannel
  };
  const accountEmail =
    channelObject && channelObject.rawIdentity && channelObject.rawIdentity.email;
  logger.debug("Extracted account email", { accountEmail });

  return chipiUserData.instance
    .getPersonById(data.sentByPersonId)
    .then(sentByPerson => {
      // TODO: implement better caching strategy
      const previewDataLoadingPromise = preloadPreviewData(data);

      const mimeType = {
        // Replace the google icon to bigger resolution
        icon: data.iconSuggestion.replace(
          "https://drive-thirdparty.googleusercontent.com/16",
          "https://drive-thirdparty.googleusercontent.com/64"
        ),
        name: data.mimeTypeSuggestion,
        normalizedName: normalizeMimeTypeName(data.mimeTypeSuggestion)
      };

      let resultItem = {
        id: foundItem._id,
        account: channelObject && channelObject.domain,
        chipi: {
          channel: {
            icon: icons[data.fromChannel],
            fromChannel: channelObject.fromChannel,
            primaryName: channelObject.primaryName,
            secondaryName: channelObject.domain,
            primaryImage: channelObject.primaryImage,
            domain: channelObject.email_domain,
            channelOnClick: event => {
              event.stopPropagation();
              actions.open(
                `https://accounts.google.com/AccountChooser?Email=${accountEmail}&continue=https://drive.google.com`
              );
            }
          },
          tunnel: {
            ...tunnelObject,
            tunnelOnClick: event => {
              event.stopPropagation();
              if (!tunnelObject.externalLinkSuggestion) {
                return;
              }
              actions.open(tunnelObject.externalLinkSuggestion);
            }
          },
          sentByPerson: sentByPerson && {
            image: sentByPerson.image,
            name: sentByPerson.displayName
          },
          mimeType
        },
        icon: icons[data.fromChannel], // For gdrive, the icon is the mimetype icon most of the time
        sentByPerson: sentByPerson && {
          image: sentByPerson.image,
          title: sentByPerson.displayName || sentByPerson.name
        },
        avatars: sentByPerson && [
          {
            src: sentByPerson.image,
            title: sentByPerson.displayName
          }
        ],
        onSelect: () => {
          actions.open(googleAccountSwitchUrl(openUrl, accountEmail));
        },
        mimeTypeIcon: data.iconSuggestion.replace(
          "https://drive-thirdparty.googleusercontent.com/16",
          "https://drive-thirdparty.googleusercontent.com/64"
        ),
        title: data.subject,
        subtitleIcon: mimeType.icon,
        subtitle: `${mimeType.normalizedName} ${data.fileSize || ""}`,
        breadcrumbTitle: data.subject,
        mimeType: data.mimeTypeSuggestion,
        timestamp: data.updatedAt
          ? formatTimestamp(data.updatedAt)
          : data.createdAt && formatTimestamp(data.createdAt),
        getPreview: () => {
          return (
            <Preview
              tunnel={tunnelObject}
              subject={data.subject}
              mimeType={mimeType}
              previewLoadingPromise={previewDataLoadingPromise}
            />
          );
        },
        headerDelimiter: "/" // optional custom header delimiter, if not specified the default (>) will be used
      };

      resultItem.actions = [
        {
          name: "Copy Url",
          keys: "CmdOrCtrl+c",
          fn: event => {
            clipboard.writeText(openUrl);
            event.preventDefault();
          }
        },
        presentationUrl && {
          name: "Present",
          longName: "Present",
          keys: "CmdOrCtrl+p",
          fn: event => {
            actions.open(googleAccountSwitchUrl(presentationUrl, accountEmail));
            event.preventDefault();
          }
        },
        {
          name: "Open",
          longName: "Open in Drive",
          keys: "enter",
          fn: event => {
            actions.open(googleAccountSwitchUrl(openUrl, accountEmail));
            event.preventDefault();
          }
        },
        showUrl && {
          name: "Show",
          longName: "Show in Drive",
          keys: "CmdOrCtrl+enter",
          fn: event => {
            actions.open(googleAccountSwitchUrl(showUrl, accountEmail));
            event.preventDefault();
          }
        },
        {
          name: "Details",
          keys: "right",
          fn: event => {
            actions.openDetailsView("Details", resultItem);
            event.preventDefault();
          },
          allowedActions: ["Open", "Show", "Copy Url", "Present"]
        }
      ].filter(Boolean);

      return resultItem;
    })
    .catch(err => {
      logger.error("Failed to process gdrive message", { err });
      throw err;
    });
}

function preloadPreviewData(foundItemSource) {
  const thumbnailFetchOption = {
    applicationId: foundItemSource.fromChannel,
    authorizedByAccount: foundItemSource.fromChannelAccount,
    objectType: foundItemSource.rawType,
    objectId: foundItemSource.rawIdentity.id,
    asThumbnail: true
  };

  const thumbnailFetchPromise = ChipiConnectorService.fetchApplicationObjectPreviewAsync(
    thumbnailFetchOption
  );

  // TODO: The pdf preview is not working property in Chrome 60, we need to use temp file instead of the base 64 encoded pdf content
  return thumbnailFetchPromise;
}

/**
 * Generate message target url
 * @param {*} foundObject
 * @param {*} searchTerm
 */
function generateDriveOpenUrl(foundObject, searchTerm) {
  return foundObject && foundObject.externalLinkSuggestion
    ? foundObject.externalLinkSuggestion
    : `https://drive.google.com/drive/u/0/search?q=${searchTerm}`;
}

function generateDriveShowUrl(tunnelObject, messageObject) {
  return (
    (tunnelObject && tunnelObject.externalLinkSuggestion
      ? tunnelObject.externalLinkSuggestion
      : `https://drive.google.com/drive/u/0/shared-with-me`) +
    `?action=locate&id=${messageObject.rawIdentity.id}`
  );
}

/**
 * Generate presentation url for GDrive item
 */
function generateDrivePresentationUrl(foundObject) {
  if (foundObject.mimeTypeSuggestion !== "application/vnd.google-apps.presentation") return;

  return `https://docs.google.com/presentation/d/${foundObject.rawIdentity.id}/present#slide=id.p`;
}

export default {
  toSearchResultFormat
};
