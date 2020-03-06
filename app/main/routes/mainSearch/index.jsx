/* eslint default-case: 0 */
"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { remote, ipcRenderer, shell } from "electron";
import { focusableSelector } from "cerebro-ui";
import cn from "classnames";
import { on } from "@app/lib/rpc";

import MainInput from "@app/main/components/MainInput";

import OutputPanel from "@app/main/components/OutputPanel";

import MagicFilterSuggestion from "@app/main/components/MagicFilterSuggestion";
import SearchStatus from "@app/main/components/SearchStatus";
import styles from "./styles.css";
import commonStyles from "@app/main/components/Common/styles.css";
import * as searchActions from "@app/main/actions/search";
import * as authActions from "@app/main/actions/auth";
import * as connectActions from "@app/main/store/connect/actions";

import Logger from "@app/lib/logger";
import List from "collections/list";

import ActionsBar from "@app/main/components/ActionsBar";

import Logo from "@app/main/components/Logo";
import { withRouter } from "react-router";
import { CHIPI_WEB_CLIENT } from "Environment";
import ResourceIcon, { IconsCollection } from "@app/main/components/ResourceIcon";

const logger = new Logger("component.Chipi");

import {
  INPUT_HEIGHT,
  RESULT_HEIGHT,
  STATUS_BAR_HEIGHT,
  MAX_VISIBLE_RESULTS,
  NO_FOUND_ITEMS_HEIGHT,
  WARNING_BAR_HEIGHT,
  MAGIC_FILTER_HEIGHT,
  MAGIC_FILTER_PADDING
} from "../../constants/ui";

//const trackShowWindow = () => trackEvent(SHOW_EVENT)
//const trackSelectItem = label => trackEvent({ ...SELECT_EVENT, label })

/**
 * Wrap click or mousedown event to custom `select-item` event,
 * that includes only information about clicked keys (alt, shift, ctrl and meta)
 *
 * @param  {Event} realEvent
 * @return {CustomEvent}
 */
const wrapEvent = realEvent => {
  const event = new CustomEvent("select-item", { cancelable: true });
  event.altKey = realEvent.altKey;
  event.shiftKey = realEvent.shiftKey;
  event.ctrlKey = realEvent.ctrlKey;
  event.metaKey = realEvent.metaKey;
  return event;
};

/**
 * Set focus to first focusable element in preview
 */
const focusPreview = () => {
  const previewDom = document.getElementById("preview");
  const firstFocusable = previewDom && previewDom.querySelector(focusableSelector);
  if (firstFocusable) {
    firstFocusable.focus();
  }
};

/**
 * Calculate the container height of the main search area (includes output panel)
 * @param {*} outputs
 * @param {*} hasNoFoundItems
 * @param {*} showingDetailsView
 * @param {*} magicFilterSuggestionLength
 */
const calculateChipiSearchHeight = (
  outputs,
  hasNoFoundItems,
  showingDetailsView,
  //magicFilterSuggestionLength,
  hasWarning
) => {
  const outputsLength = outputs.length;

  let chipiSearchHeight = 0; // Initialise with padding for border

  if (hasNoFoundItems) {
    chipiSearchHeight += INPUT_HEIGHT + NO_FOUND_ITEMS_HEIGHT;
  } else if (outputsLength === 0 /*|| !resultsReady*/) {
    chipiSearchHeight += INPUT_HEIGHT;
  } else {
    const resultHeight = showingDetailsView
      ? MAX_VISIBLE_RESULTS
      : Math.min(outputsLength, MAX_VISIBLE_RESULTS);
    chipiSearchHeight += resultHeight * RESULT_HEIGHT + INPUT_HEIGHT + STATUS_BAR_HEIGHT;
    //chipiSearchHeight += ACTIONS_HEIGHT;
  }

  // add the height of magic filter element if there is one displayed
  /* chipiSearchHeight +=
    magicFilterSuggestionLength > 0
      ? magicFilterSuggestionLength * MAGIC_FILTER_HEIGHT + MAGIC_FILTER_PADDING
      : 0;*/

  chipiSearchHeight += hasWarning ? WARNING_BAR_HEIGHT : 0; // +2 the top border

  return chipiSearchHeight;
};

/**
 * Main search container
 */
class MainSearch extends Component {
  constructor(props) {
    super(props);
    this.electronWindow = remote.getCurrentWindow();

    this.updateElectronWindow = this.updateElectronWindow.bind(this);

    this.onMainInputFocus = this.onMainInputFocus.bind(this);
    this.onMainInputBlur = this.onMainInputBlur.bind(this);

    this.cleanup = this.cleanup.bind(this);
    this.focusMainInput = this.focusMainInput.bind(this);
    this.highlightMainInput = this.highlightMainInput.bind(this);
    this.mouseClickElement = this.mouseClickElement.bind(this);
    this.onFixConnectClicked = this.onFixConnectClicked.bind(this);

    this.getAutocomplete = this.getAutocomplete.bind(this);

    this.state = {
      mainInputFocused: true,
      shouldFocusSignIn: false,
      // TODO: move this property down to child component to improve performance
      showActionsForSelectedOutput: true,

      hotKeysCollection: new List(),
      hotKeys: {}
    };

    this.electronWindow.on("show", this.focusMainInput);
    this.electronWindow.on("show", this.highlightMainInput);
    this.electronWindow.on("show", this.updateElectronWindow);
    //this.electronWindow.on('show', trackShowWindow)

    this.mainChipiActions = [
      {
        name: "search reset",
        keys: "esc",
        fn: event => {
          logger.verbose("Esc called");
          if (this.props.term.length === 0) {
            this.props.hideWindow();
          } else {
            this.props.searchActions.reset();
          }
        }
      },
      {
        name: "input focus",
        keys: "tab",
        fn: event => {
          // TODO: Redo the signin button focus logic, this isn't clean
          if (!this.props.authState.isAuthenticated && this.state.mainInputFocused) {
            this.focusSignIn();
          } else if (this.state.shouldFocusSignIn) {
            this.focusMainInput();
          }
        }
      }
    ];
  }

  componentDidMount() {
    logger.verbose("Chipi main did mount");

    // Once component mounting again, reset the hotkeys collection
    //hotKeysHelper.clear();
    //registerHotKeys("main", this.mainKeys, this.mainKeyHandlers);

    this.focusMainInput();
    this.updateElectronWindow();

    // Handle `showTerm` rpc event and replace search term with payload
    on("showTerm", term => this.props.searchActions.updateTerm(term));
  }

  componentDidUpdate(prevProps, prevState) {
    const { outputs } = this.props;

    this.updateElectronWindow();
  }

  componentWillUnmount() {
    this.cleanup();
  }

  onMainInputFocus() {
    logger.verbose("Main input focus called");
    this.setState({
      mainInputFocused: true,
      shouldFocusSignIn: false
    });
  }

  onMainInputBlur() {
    logger.verbose("Main input blur called");
    this.setState({ mainInputFocused: false });
  }

  onFixConnectClicked() {
    shell.openExternal(CHIPI_WEB_CLIENT.host);
    this.props.connectActions.fixingConnectClicked();
  }

  cleanup() {
    this.electronWindow.removeListener("show", this.focusMainInput);
    this.electronWindow.removeListener("show", this.updateElectronWindow);
  }

  focusMainInput() {
    logger.verbose("Focus main input function called");
    if (this.mainInput) this.mainInput.focus();
  }

  /**
   * Hightlight all text within the main input field
   */
  highlightMainInput() {
    if (this.mainInput) this.mainInput.highlight();
  }

  focusSignIn() {
    this.setState({ shouldFocusSignIn: true });
  }

  /**
   * Get highlighted result
   * @return {Object}
   */
  getHighlightedResult() {
    return this.props.highlightedOutputItem;
    //outputs[this.props.highlightedOutputIndex]
  }

  /**
   * Select item from results list
   * @param  {[type]} item [description]
   * @return {[type]}      [description]
   */
  mouseClickElement(item, realEvent) {
    const event = wrapEvent(realEvent);
    if (item.onSelect) {
      item.onSelect(event);
    }

    if (!event.defaultPrevented) {
      this.props.hideWindow();
    }
  }

  /**
   * Set resizable and size for main electron window when results count is changed
   */
  updateElectronWindow() {
    /*const { chipiWindowHeight } = this.props;
    const win = this.electronWindow;
    const [width] = win.getSize();

    // We need bottom padding to help the transparent background for the floating magic filter list
    const minWindowHeight = INPUT_HEIGHT;
    const appWindowHeight =
      chipiWindowHeight +
      VERTICAL_PADDING +
      (minWindowHeight - chipiWindowHeight > 0 ? minWindowHeight - chipiWindowHeight : 0);

    logger.verbose("Window height", { chipiWindowHeight, minWindowHeight, appWindowHeight });

    //win.setMinimumSize(WINDOW_WIDTH, appWindowHeight);
    win.setSize(width, appWindowHeight);*/
  }

  getAutocomplete() {
    if (this.props.autocomplete) {
      return this.props.autocomplete;
    }

    // item autocomplete value
    const possibleAutocompleteItem =
      this.getHighlightedResult() || (this.props.outputs && this.props.outputs[0]);

    if (
      possibleAutocompleteItem &&
      possibleAutocompleteItem.term &&
      possibleAutocompleteItem.term !== this.props.term &&
      possibleAutocompleteItem.term.toLowerCase().startsWith(this.props.term.toLowerCase())
    ) {
      return {
        value: possibleAutocompleteItem.term,
        startIndex: 0,
        matchTerm: this.props.term,
        paddingPart: possibleAutocompleteItem.term.substring(this.props.term.length)
      };
    }
    return null;
  }

  render() {
    const { mainInputFocused } = this.state;
    const {
      searchActions,
      authState,
      autoSearch,
      term,
      searchingInFlight,
      chipiSearchHeight,
      registerHotKeys,
      deregisterHotKeys,
      inactivatedConnects,
      openFeedbackWindow
    } = this.props;

    return (
      <div>
        <div
          style={{ height: chipiSearchHeight }}
          className={cn(styles.search, styles[process.platform])}
        >
          <ActionsBar
            actions={this.mainChipiActions}
            registerHotKeys={registerHotKeys}
            deregisterHotKeys={deregisterHotKeys}
            isActivated={true}
            hotKeysCategory="chipiMainSearch"
            className="resultsListActions"
            invisible={true}
          />
          <div
            className={cn(
              styles.inputWrapper,
              styles.unselectable,
              !searchingInFlight && styles.inputWrapperHasResults,
              process.platform === "darwin" && commonStyles.draggable
            )}
            aria-autocomplete="list"
            tabIndex={-1}
            //onKeyDown={this.onKeyDown}
          >
            <div className={styles.iconWrapper}>
              <Logo
                className={cn(styles.iconMainInput, commonStyles.draggable)}
                isLoading={authState.isAuthenticating || searchingInFlight}
              />
            </div>
            <MainInput
              value={term}
              ref={c => (this.mainInput = c)}
              onFocus={this.onMainInputFocus}
              onBlur={this.onMainInputBlur}
              name={
                authState && authState.user && (authState.user.givenName || authState.user.name)
              }
              autocomplete={this.getAutocomplete()}
              registerHotKeys={registerHotKeys}
              deregisterHotKeys={deregisterHotKeys}
              searchActions={searchActions}
              autoSearch={autoSearch}
            />

            <SearchStatus
              isOffline={authState.isOffline}
              term={term}
              authState={authState}
              login={() => ipcRenderer.send("signIn")}
              ref={c => (this.searchStatus = c)}
              shouldFocusSignIn={this.state.shouldFocusSignIn}
              onSignInButtonBlur={this.onSignInButtonBlur}
            />
          </div>
          {inactivatedConnects && inactivatedConnects.length > 0 && (
            <div className={styles.warning}>
              <span className={styles.warningIconsWrapper}>
                {inactivatedConnects.map((inactivatedConnect, index) => {
                  return (
                    <ResourceIcon
                      key={index}
                      icon={IconsCollection.logos[inactivatedConnect.applicationId]}
                      className={styles.warningIcon}
                    />
                  );
                })}
              </span>
              <div className={styles.warningDescription}>
                Oops! Some connected applications are disabled.
              </div>
              <button className={styles.warningButton} onClick={this.onFixConnectClicked}>
                Fix them in chipi.io
              </button>
            </div>
          )}

          <OutputPanel
            mainInputFocused={mainInputFocused}
            mouseClickElement={this.mouseClickElement}
            term={term}
            registerHotKeys={registerHotKeys}
            deregisterHotKeys={deregisterHotKeys}
            onFeedbackButtonClick={openFeedbackWindow}
            focusMainInput={this.focusMainInput}
          />
        </div>

        <MagicFilterSuggestion
          term={term}
          registerHotKeys={registerHotKeys}
          deregisterHotKeys={deregisterHotKeys}
        />
      </div>
    );
  }
}

MainSearch.propTypes = {
  searchActions: PropTypes.shape({
    search: PropTypes.func,
    reset: PropTypes.func,
    moveOutputCursor: PropTypes.func,
    moveSuggestionCursor: PropTypes.func,
    updateTerm: PropTypes.func,
    changeVisibleResults: PropTypes.func,
    jumpOutputCursor: PropTypes.func,
    hideMagicFilterSuggestion: PropTypes.func
  }),
  authState: PropTypes.object,
  term: PropTypes.string,
  autoSearch: PropTypes.bool,
  searchingInFlight: PropTypes.bool,
  registerHotKeys: PropTypes.func,
  deregisterHotKeys: PropTypes.func,
  hideWindow: PropTypes.func
};

function mapStateToProps(state) {
  const hasWarning =
    state.connect.inactivatedConnects && state.connect.inactivatedConnects.length > 0;

  const chipiSearchHeight = calculateChipiSearchHeight(
    state.output.outputs,
    state.output.hasNoFoundItems,
    state.outputDetailsView.showingDetailsView,
    hasWarning
  );

  return {
    term: state.search.term,
    authState: state.authState,
    autoSearch: state.search.autoSearch,
    searchingInFlight: state.search.searchingInFlight,
    hasNoFoundItems: state.output.hasNoFoundItems,
    outputs: state.output.outputs,
    highlightedOutputItem: state.output.highlightedOutputItem,
    showingDetailsView: state.outputDetailsView.showingDetailsView,
    autocomplete: state.search.autocomplete,
    chipiSearchHeight,
    inactivatedConnects: state.connect.inactivatedConnects,
    hasWarning
  };
}

function mapDispatchToProps(dispatch) {
  return {
    searchActions: bindActionCreators(searchActions, dispatch),
    authActions: bindActionCreators(authActions, dispatch),
    connectActions: bindActionCreators(connectActions, dispatch)
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MainSearch)
);
