/* eslint default-case: 0 */
"use strict";

import React, { Component } from "react";
import styles from "./styles.css";
import Logger from "../../../../../../../lib/logger";
import ReactMarkdown from "react-markdown";


const logger = new Logger("plugins.chipi.rendering.engines.trello.preview");

class Preview extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { tunnel, threadObject, messageObject } = this.props;

    const subject = (threadObject ? threadObject.subject : messageObject.subject) || "";

    return (
      <div className={styles.trelloPreivewWrapper}>
        {tunnel && (
          <div className={styles.messageTunnel}>
            <span>{tunnel.name}</span>
          </div>
        )}
        <div className={styles.trelloPreviewContent}>
          <div
            className={styles.messageSubject}
            dangerouslySetInnerHTML={{
              __html: subject.replace(/(?:\r\n|\r|\n)/g, "<br />")
            }}
          />
          <ReactMarkdown source={`${threadObject ? "[comment] " : ""}${messageObject.text.replace(/(?:\r\n|\r|\n)/g, "<br />")}`} className={styles.messageText} />
        </div>
      </div>
    );
  }
}

export default Preview;
