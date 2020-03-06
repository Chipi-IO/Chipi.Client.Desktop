"use strict";

import React, { Component } from "react";
import cn from "classnames";
import Loading from "./Loading";

import styles from "./styles.css";

import Logger from "@app/lib/logger";

const logger = new Logger("components.OutputsList.Summary");

class Summary extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { outputs, isLoading } = this.props;
    return (
      <div className={cn(styles.summaryWrapper)}>
        <div>{outputs.length} results found</div>
        {isLoading && <Loading />}
      </div>
    );
  }
}

export default Summary;
