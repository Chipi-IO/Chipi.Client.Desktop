/* eslint default-case: 0 */
"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "./styles.css";
import Logger from "../../../../../../../lib/logger";
import Loading from "../../components/Loading";

const logger = new Logger("plugins.chipi.rendering.engines.gdrive.preview");
const hangoutsChannelName = "hangouts";

class Preview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      previewReady: false,
      previewData: null
    };

    this.renderPreviewData = this.renderPreviewData.bind(this);
  }

  renderPreviewData() {
    const { previewData } = this.state;

    logger.verbose("Preview data meta", {
      mimeType: previewData && previewData.mimeType,
      dataType: previewData && previewData.dateType
    });

    return (
      <div className={styles.previewData}>
        {!previewData && (
          <div className={styles.noPreview}>Ooops, no preview available.</div>
        )}
        {previewData && previewData.mimeType === "application/pdf" &&
          previewData.dataType === "base64" && (
            <iframe
              title=""
              src={`data:application/pdf;#toolbar=0&navpanes=0;base64,${
                previewData.data
              }`}
              className={styles.pdfPreviewer}
              frameBorder='0'
            />
          )}
        {previewData && previewData.mimeType === "image/png" &&
          previewData.dataType === "base64" && (
            <img
              src={`data:${previewData.mimeType};base64,${previewData.data}`}
            />
          )}
      </div>
    );
  }

  componentDidMount() {
    const { previewLoadingPromise } = this.props;

    //logger.verbose('gdrive preview mounted', { previewLoadingPromise });

    if (!previewLoadingPromise) {
      this.setState({
        previewReady: true
      });
    }

    previewLoadingPromise.then(previewData => {
      this.setState({
        previewReady: true,
        previewData: previewData
      });
    });
  }

  render() {
    const { subject, tunnel, mimeType } = this.props;
    const { previewReady } = this.state;

    return (
      <div className={styles.gdrivePreivewWrapper}>
        {previewReady && this.renderPreviewData()}
        {!previewReady && <Loading />}
      </div>
    );
  }
}

export default Preview;
