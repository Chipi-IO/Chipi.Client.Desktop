import React from "react";

interface IResourceIcon {
  url: string;
  name: string;
}

interface IResourceIconCollection {
  [key: string]: IResourceIcon | IResourceIconCollection;
}

export const IconsCollection: IResourceIconCollection = {
  search: { url: `../resources/icons/system/search.svg`, name: "search" },
  close: { url: `../resources/icons/system/close.svg`, name: "close" },
  logos: {
    slack: { url: `../resources/icons/applications/slack.svg`, name: "slack" },
    gmail: { url: `../resources/icons/applications/gmail.svg`, name: "gmail" },
    gdrive: { url: `../resources/icons/applications/gdrive.svg`, name: "gdrive" },
    outlook: { url: `../resources/icons/applications/outlook.png`, name: "outlook" },
    trello: { url: `../resources/icons/applications/trello.png`, name: "trello" },
    hangouts: { url: `../resources/icons/applications/hangouts.svg`, name: "hangouts" }
  }
};

export default function(iconProps: { icon?: IResourceIcon; className: string }) {
  const { icon, className } = iconProps;
  return icon ? (
    <img className={className || "defaultIcon"} src={icon.url} alt={icon.name} />
  ) : (
    <span />
  );
}
