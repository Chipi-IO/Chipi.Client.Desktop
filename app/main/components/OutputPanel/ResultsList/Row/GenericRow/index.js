import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "../styles.css";
import cn from "classnames";
import AvatarGroup from "../../../../Avatar/AvatarGroup";
import ResultIcon from "../../../ResultIcon";
import Logger from "../../../../../../lib/logger";
import dateFormat from "dateformat";
import HeaderLine from "../../../HeaderLine";

const logger = new Logger("outputPanel.genericRow");

class GenerictRow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      title,
      onMouseClick,
      onMouseOver,
      subtitle,
      subtitleIcon,
      tunnel,
      timestamp,
      account,
      icon,
      selected,
      renderingTitleAsHtml,
      renderingSubtitleAsHtml,
      avatars,
      updated,
      isApplication,
      chipi,
      tunnelPrefix,
      headerDelimiter
    } = this.props;

    const tunnelInfo = chipi && chipi.tunnel;
    const channelInfo = chipi && chipi.channel;
    //debugger;
    return (
      <div
        className={cn(styles.row, selected && styles.selected)}
        onClick={onMouseClick}
        onMouseOver={onMouseOver}
      >
        <div
          className={cn(styles.rowContent, selected && styles.selected, updated && styles.updated)}
        >
          <div className={styles.avatarWrapper}>
            {avatars && (
              <AvatarGroup className={styles.avatars} selected={selected} avatars={avatars} />
            )}

            <ResultIcon
              icon={icon}
              size={isApplication ? "large" : "medium"}
              className={isApplication ? styles.rowApplicationIconWrapper : styles.rowIconWrapper}
            />
          </div>

          <div className={styles.detailsWrapper}>
            <div className={styles.details}>
              <HeaderLine
                tunnelInfo={tunnelInfo}
                channelInfo={channelInfo}
                className="resultsList"
                title={title}
                renderingTitleAsHtml={renderingTitleAsHtml}
                headerDelimiter={headerDelimiter}
                selected={selected}
              />
              {subtitle && (
                <div>
                  {renderingSubtitleAsHtml ? (
                    <div
                      className={styles.subtitle}
                      dangerouslySetInnerHTML={{ __html: subtitle }}
                    />
                  ) : (
                    <div className={styles.subtitle}>
                      {" "}
                      {subtitleIcon ? (
                        <div className={styles.subtitleIconWrapper}>
                          <ResultIcon
                            icon={subtitleIcon}
                            size="xsmall"
                            className={styles.rowFileIcon}
                          />
                          <span className={styles.rowFileDescription}>
                            {subtitle.trim ? subtitle.trim() : subtitle}
                          </span>
                        </div>
                      ) : (
                        <span>{subtitle.trim ? subtitle.trim() : subtitle}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {timestamp && (
            <span className={styles.timestamp}>{dateFormat(timestamp, "dd mmm yyyy")}</span>
          )}
        </div>
      </div>
    );
  }
}

GenerictRow.propTypes = {
  title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  icon: PropTypes.string,
  selected: PropTypes.bool,
  subtitle: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  subtitleIcon: PropTypes.string,
  onMouseClick: PropTypes.func,
  onMouseOver: PropTypes.func,
  onDisplayActions: PropTypes.func,
  registerHotKeys: PropTypes.func,
  deregisterHotKeys: PropTypes.func,
  focused: PropTypes.bool,
  updated: PropTypes.bool
};

export default GenerictRow;
