import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import styles from "./styles.css";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Logger from "../../../lib/logger";
import ResultsList from "./ResultsList";
import DetailsView from "./DetailsView";
import cn from "classnames";
import * as outputActions from "../../actions/output";
import SlidingCard from "./SlidingCard";
import { MAX_OUTPUT_HEIGHT, CONTENT_VISIBLE_WIDTH } from "../../constants/ui";

const logger = new Logger("components.OutputPanel");

class OutputPanel extends PureComponent {
  constructor(props) {
    super(props);

    this.hideDetailsView = this.hideDetailsView.bind(this);
  }

  hideDetailsView(){
    this.props.outputActions.hideDetailsView();
    this.props.focusMainInput();
  }

  render() {
    const {
      term,
      hasNoFoundItems,
      mainInputFocused,
      mouseClickElement,
      showingDetailsView,
      registerHotKeys,
      deregisterHotKeys,
      outputActions,
      authState,
      showingActionView,
      onFeedbackButtonClick,
      detailsViewActions,
      detailsItem,
      magicFilterSuggestion,
      results
    } = this.props;

    if (hasNoFoundItems) {
      return (
        <div className={styles.noResults}>
          <span className={styles.emoji}>👻</span> No results found
        </div>
      );
    }

    if (results && results.length > 0) {
      return (
        <div
          style={{ maxHeight: MAX_OUTPUT_HEIGHT, width: CONTENT_VISIBLE_WIDTH }}
          className={cn(styles.outputPanelWrapper)}
        >
          <SlidingCard
            atTheFront={!showingDetailsView && !showingActionView && !magicFilterSuggestion}
            isVisible={true}
            layer={0}
            clickWhenAtBack={this.hideDetailsView}
          >
            <ResultsList
              outputs={results}
              mainInputFocused={mainInputFocused}
              term={term}
              mouseClickElement={mouseClickElement}
              outputActions={outputActions}
              focused={!showingDetailsView && !showingActionView && !magicFilterSuggestion}
              forceFullHeight={showingDetailsView || showingActionView}
              registerHotKeys={registerHotKeys}
              deregisterHotKeys={deregisterHotKeys}
              isAuthenticated={authState.isAuthenticated}
              onFeedbackButtonClick={onFeedbackButtonClick}
            />
          </SlidingCard>
          <SlidingCard
            atTheFront={showingDetailsView}
            isVisible={showingDetailsView || showingActionView}
            layer={1}
          >
            <DetailsView
              focused={showingDetailsView}
              registerHotKeys={registerHotKeys}
              deregisterHotKeys={deregisterHotKeys}
              detailsViewActions={detailsViewActions}
              detailsItem={detailsItem}
              hideDetailsView={this.hideDetailsView}
            />
          </SlidingCard>
          <SlidingCard atTheFront={showingActionView} isVisible={showingActionView} layer={2} />
        </div>
      );
    }

    return null;
  }
}

OutputPanel.propTypes = {
  registerHotKeys: PropTypes.func,
  focusMainInput: PropTypes.func
};

function mapStateToProps(state) {
  return {
    showingDetailsView: state.outputDetailsView.showingDetailsView,
    detailsViewActions: state.outputDetailsView.detailsViewActions,
    detailsItem: state.outputDetailsView.detailsItem,
    hasNoFoundItems: state.output.hasNoFoundItems,
    outputs: state.output.outputs,
    authState: state.authState,
    magicFilterSuggestion: state.magicFilter.magicFilterSuggestion,
    results: state.output.results
  };
}

function mapActionsToProps(dispatch) {
  return {
    outputActions: bindActionCreators(outputActions, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapActionsToProps
)(OutputPanel);
