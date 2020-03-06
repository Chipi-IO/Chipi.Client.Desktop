/* eslint default-case: 0 */
"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "./styles.css";
import Logger from "../../../../../../../lib/logger";

const logger = new Logger("plugins.chipi.rendering.engines.slack.preview");
const hangoutsChannelName = "hangouts";

class Preview extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { parsedSlackText, tunnel } = this.props;

    return (
      <div className={styles.slackPreivewWrapper}>
        <div
          className={styles.previewMessage}
          dangerouslySetInnerHTML={{ __html: parsedSlackText }}
        />
      </div>
    );
  }
}

export default Preview;
