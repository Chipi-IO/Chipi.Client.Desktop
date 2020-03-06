/* eslint default-case: 0 */
"use strict";

import React, { Component } from "react";
import Logger from "../../../../lib/logger";
import styles from "./styles.css";

const logger = new Logger("plugins.chipi.easterEgg.preview");

const eggs = {
  tetris: "https://oscarotero.github.io/chipi-client/tetris/"
};

class Preview extends Component {
  constructor(props) {
    super(props);
    this.previewRef = React.createRef();
  }

  componentDidMount(){
    this.previewRef.current.focus();
  }

  render() {
    const { egg } = this.props;

    return (
      <div className={styles.eggViewWrapper}>
        <webview
          src={eggs[egg]}
          style={{ display: "inline-flex", width: "100%", height: "100%" }}
          autoFocus="true"
          ref={this.previewRef}
        />
      </div>
    );
  }
}

export default Preview;
