/* eslint default-case: 0 */
"use strict";

import React, { Component } from "react";
import styles from "./styles.css";
import Logger from "../../../../../../../lib/logger";
import ReactMarkdown from "react-markdown";


const logger = new Logger("plugins.chipi.rendering.engines.trello.preview.tunnel");

class TunnelPreview extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { tunnelObject } = this.props;

    return (
      <div className={styles.trelloPreivewWrapper}>
        {tunnelObject && (
          <div className={styles.messageTunnel}>
            <span>{`[Board] ${tunnelObject.name}`}</span>
          </div>
        )}
      </div>
    );
  }
}

export default TunnelPreview;
