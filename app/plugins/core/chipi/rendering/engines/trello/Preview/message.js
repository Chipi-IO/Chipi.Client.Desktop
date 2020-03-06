/* eslint default-case: 0 */
"use strict";

import React, { Component } from "react";
import styles from "./styles.css";
import Logger from "../../../../../../../lib/logger";
import ReactMarkdown from "react-markdown";

const logger = new Logger("plugins.chipi.rendering.engines.trello.preview.message");

class MessagePreview extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { tunnelObject, threadObject, messageObject, appearedInOtherTunnelsObjects } = this.props;

    logger.verbose("Trello message appeared in other tunnels", { appearedInOtherTunnelsObjects });

    const subject = (threadObject ? threadObject.subject : messageObject.subject) || "";

    return (
      <div className={styles.trelloPreivewWrapper}>
        <div className={styles.trelloPreviewContent}>
          <div
            className={styles.messageSubject}
            dangerouslySetInnerHTML={{
              __html: subject.replace(/(?:\r\n|\r|\n)/g, "<br />")
            }}
          />
          {appearedInOtherTunnelsObjects && appearedInOtherTunnelsObjects.length > 0 && (
            <div className={styles.additionalTunnelsWrapper}>
              {appearedInOtherTunnelsObjects.map((otherTunnelObject, index) => {
                return (
                  <div key={index} className={styles.additionalTunnel}>
                    {otherTunnelObject.name}
                  </div>
                );
              })}
            </div>
          )}
          <div className={styles.messageText}>
            {threadObject && <b>[comment]</b>}
            <ReactMarkdown source={`${messageObject.text || ""}`} />
          </div>
        </div>
      </div>
    );
  }
}

export default MessagePreview;
