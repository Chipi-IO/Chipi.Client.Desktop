/* eslint default-case: 0 */
"use strict";

import React, { Component } from "react";
import styles from "./styles.css";
import Logger from "../../../../../../../lib/logger";

const logger = new Logger("plugins.chipi.rendering.engines.outlook.preview");
const hangoutsChannelName = "hangouts";

class Preview extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { subject, text } = this.props;

    return (
      <div className={styles.gmailPreivewWrapper}>
        <div className={styles.previewSubject}>{subject}</div>
        <div className={styles.previewContent}>
          {text
            .replace(/\n{2,}/g, "\n\n")
            .split("\n")
            .map(function(item, key) {
              return (
                <span key={key} className={styles.previewContentLine}>
                  {item}
                  <br />
                </span>
              );
            })}
        </div>
      </div>
    );
  }
}

export default Preview;
