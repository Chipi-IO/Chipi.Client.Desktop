import React from "react";
import cn from "classnames";
import styles from "./styles.css";
import chipiAnalytics from "../../../../lib/chipi/analytics";

const _headerLineLinkOnclick = (event, onClickFn, targetType, targetName) => {
  if (!onClickFn) {
    return;
  }

  // TODO: move this event to the same palce where other actions triggering the chipi event
  chipiAnalytics.addNewEvent(
    `search.result.action`,
    {
      type: targetType,
      name: targetName
    },
    { name: `BreadCrumbClick`, triggeredKeys: `mouse.click` }
  );

  onClickFn(event);
};

export default function HeaderLine({
  headerDelimiter = ">",
  channelInfo,
  tunnelInfo,
  className = "resultsList",
  title = "",
  renderingTitleAsHtml = false,
  selected = false
}) {
  const tunnelPrefix = (tunnelInfo && tunnelInfo.prefix) || "";

  return (
    <div className={cn(styles.headerLineWrapper, styles[className], selected && styles.selected)}>
      {channelInfo && (
        <a
          onClick={event =>
            _headerLineLinkOnclick(
              event,
              channelInfo.channelOnClick,
              "channel",
              channelInfo.primaryName
            )
          }
          className={styles.channelInfo}
        >
          {channelInfo.primaryName}
        </a>
      )}

      {tunnelInfo && (
        <div className={styles.tunnelInfo}>
          {tunnelInfo.name && (
            <React.Fragment>
              <span className={styles.headerDelimiter}>{headerDelimiter}</span>
              <div className={styles.tunnelName}>
                {`${tunnelPrefix}`}
                <a
                  onClick={event =>
                    _headerLineLinkOnclick(
                      event,
                      tunnelInfo.tunnelOnClick,
                      "tunnel",
                      tunnelInfo.name
                    )
                  }
                >
                  {tunnelInfo.name}
                </a>
                {title && <span className={styles.headerDelimiter}>{`${headerDelimiter}`}</span>}
              </div>
            </React.Fragment>
          )}
        </div>
      )}

      {title && !tunnelInfo && <div className={styles.separator} />}

      {title && (tunnelInfo && !tunnelInfo.name) && (
        <span className={styles.headerDelimiter}>{headerDelimiter}</span>
      )}

      {title && (
        <div className={styles.title}>
          {renderingTitleAsHtml ? (
            <span angerouslySetInnerHTML={{ __html: title }} />
          ) : (
            <span>{title}</span>
          )}
        </div>
      )}
    </div>
  );
}
