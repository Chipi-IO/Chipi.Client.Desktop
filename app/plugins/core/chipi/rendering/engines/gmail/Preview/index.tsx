/* eslint default-case: 0 */
"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "./styles.css";
import Logger from "../../../../../../../lib/logger";

const logger = new Logger("plugins.chipi.rendering.engines.gmail.preview");
const hangoutsChannelName = "hangouts";

export interface IPreviewProps {
  subject: string;
  htmlContent: string;
  isHangouts: boolean;
}

class Preview extends Component<IPreviewProps, {}> {
  constructor(props: IPreviewProps) {
    super(props);
  }

  render() {
    const { subject, htmlContent, isHangouts } = this.props;

    if (isHangouts)
      return (
        <div
          className={styles.gmailPreivewWrapper}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );

    return (
      <div className={styles.gmailPreivewWrapper}>
        <div className={styles.previewSubject}>{subject}</div>
        <div className={styles.previewContent} dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    );
  }
}

export default Preview;
