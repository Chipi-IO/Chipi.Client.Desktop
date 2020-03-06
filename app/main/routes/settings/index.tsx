/* eslint default-case: 0 */
"use strict";
import * as React from "react";

import Logger from "@app/lib/logger";
import { AppState } from "@app/main/store";
import { connect } from "react-redux";

import { goToRoute } from "@app/main/actions/appRoute";

const logger = new Logger("component.Chipi");

interface ISettingsProps {

}

interface ISettingsState {

}

/**
 * Main search container
 */
class Settings extends React.Component<ISettingsProps, ISettingsState> {
}



function mapStateToProps(appState: AppState) {
    return {
      resultItem: appState.fullThread.resultItem
    };
  }
  
  export default connect(
    mapStateToProps,
    { goToRoute }
  )(Settings);