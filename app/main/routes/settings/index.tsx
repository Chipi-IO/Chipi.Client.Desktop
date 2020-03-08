/* eslint default-case: 0 */
"use strict";
import * as React from "react";

import Logger from "@app/lib/logger";
import { AppState } from "@app/main/store";
import { connect } from "react-redux";

import { backToMainFromSettings } from "@app/main/actions/appRoute";

import "./styles.scss";

const logger = new Logger("component.Chipi");

interface ISettingsProps {
  backToMainFromSettings: typeof backToMainFromSettings;
}

interface ISettingsState {}

/**
 * Main search container
 */
class Settings extends React.Component<ISettingsProps, ISettingsState> {
  constructor(props: ISettingsProps) {
    super(props);
    this.onBackToMainClick = this.onBackToMainClick.bind(this);
  }

  onBackToMainClick() {
    this.props.backToMainFromSettings();
  }

  render() {
    return (
      <div tabIndex={-1} className="settings-wrapper">

        <button onClick={this.onBackToMainClick} >back to main</button>

      </div>
    );
  }
}

function mapStateToProps(appState: AppState) {
  return {
  };
}

export default connect(mapStateToProps, { backToMainFromSettings })(Settings);
