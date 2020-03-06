"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import { List } from "react-virtualized";
import { connect } from "react-redux";
import ResultRow from "./Row/ResultRow";
import ActionsBar from "../../ActionsBar";
import Summary from "./Summary";
import cn from "classnames";
import { chipiAnalytics } from "../../../../lib/chipi";

import styles from "./styles.css";
import {
  RESULT_HEIGHT,
  CONTENT_VISIBLE_WIDTH,
  MAX_VISIBLE_RESULTS,
  ACTIONS_HEIGHT
} from "../../../constants/ui";
import Logger from "../../../../lib/logger";

const logger = new Logger("OutputsList");

const shortcutKey = process.platform === "darwin" ? "⌘" : "Ctrl+";
const feedbackMessages = [
  "We ♥ feedback",
  "How is CHIPI doing?",
  "Are these results helpful?",
  "What can we do better?"
];
const feedbackMessage = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];

class OutputsList extends Component {
  constructor(props) {
    super(props);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.getRowHeight = this.getRowHeight.bind(this);

    this.moveCursor = this.moveCursor.bind(this);
    this.selectItem = this.selectItem.bind(this);
    this.jumpOutputCursor = this.jumpOutputCursor.bind(this);

    this.resultsListActions = [
      {
        name: "move cursor down",
        keys: "down",
        fn: event => {
          this.moveCursor(1);
          event.preventDefault();
        }
      },
      {
        name: "move cursor up",
        keys: "up",
        fn: event => {
          this.moveCursor(-1);
          event.preventDefault();
        }
      } /*,
      {
        name: "jump to results",
        keys: "tab",
        fn: event => {
          this.jumpOutputCursor();
          event.preventDefault();
        }
      }*/
    ];
  }

  /**
   * Move the cursor for output list
   * @param {*} offset
   */
  moveCursor(offset) {
    let numberOfOutputs = this.props.outputs.length;

    let highlightedOutputIndex = this.props.highlightedOutputIndex;

    highlightedOutputIndex += offset;

    highlightedOutputIndex = this.normalizeSelection(highlightedOutputIndex, numberOfOutputs);

    this.selectItem(highlightedOutputIndex);
  }

  jumpOutputCursor() {
    this.moveCursor(1);
  }

  selectItem(highlightedOutputIndex) {
    //logger.verbose('selectItem', { highlightedOutputIndex })

    this.props.outputActions.highlightOutputItem(highlightedOutputIndex);
  }

  /**
   * Normalize index of selectedResultIndex item.
   * Index should be >= 0 and <= results.length
   *
   * @param  {Integer} index
   * @param  {Integer} length current count of found results
   * @return {Integer} normalized index
   */
  normalizeSelection(index, length) {
    logger.verbose("Normalizing the selection", { index, length });
    if (index >= length) {
      return -1;
    } else if (index < 0) {
      return length - 1; // loop back to bottom of list
    }
    return index;
  }

  componentDidMount() {
    // move the cursor to the first item as well
    if (this.props.outputs.length > 0 && this.props.highlightedOutputItem === null) {
      this.moveCursor(1);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.highlightedOutputIndex !== this.props.highlightedOutputIndex) {
      this._list.recomputeRowHeights();
    } else if (this.props.highlightedOutputIndex < 0) {
      // highlight the first item when the new result set comes in
      this.moveCursor(1);
    }

    /*
    if (prevProps.focused !== this.props.focused) {
      this._list.recomputeRowHeights(this.props.highlightedOutputIndex);
    }*/
  }

  getRowHeight({ index }) {
    return RESULT_HEIGHT;
    //return (this.props.highlightedOutputIndex === index && output && output.actions && output.actions.length > 0) ? RESULT_HEIGHT + ACTIONS_HEIGHT : RESULT_HEIGHT;
  }

  rowRenderer({
    index, // Index of row
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    key, // Unique key within array of rendered rows
    parent, // Reference to the parent List (instance)
    style // Style object to be applied to row (to position it);
    // This must be passed through to the rendered row element.
  }) {
    const {
      highlightedOutputItem,
      registerHotKeys,
      deregisterHotKeys,
      focused,
      outputs,
      updatedResultItem
    } = this.props;
    const output = outputs[index];
    const selected = highlightedOutputItem && output.id === highlightedOutputItem.id;

    // index === this.state.highlightedOutputIndex
    const props = {
      ...output,
      updated: selected && updatedResultItem && updatedResultItem.id == output.id,
      focused,
      selected,
      onMouseClick: event => {
        logger.verbose("Item clicked and onMouseClick fired"),
          this.props.mouseClickElement(output, event);

        // TODO: Move this event into the same place where other actions at
        chipiAnalytics.addNewEvent(
          `search.result.action`,
          output && {
            id: output.id,
            title: output.title,
            plugin: output.plugin,
            displayPosition: output.displayPosition,
            searchedTerm: output.searchedTerm
          },
          { name: `MouseClick`, triggeredKeys: `mouse.click` }
        );
      },
      // Move selection to item under cursor
      onMouseOver: event => {
        const { mainInputFocused } = this.props;
        const { highlightedOutputIndex } = this.props;
        const { movementX, movementY } = event.nativeEvent;

        if (index === highlightedOutputIndex) {
          return false;
        }

        if (movementX || movementY) {
          // Hover item only when we had real movement from mouse
          // We should prevent changing of selection when user uses keyboard
          this.selectItem(index);
        }
      },
      registerHotKeys,
      deregisterHotKeys
    };

    let row;

    //logger.verbose('Outputlist row outcome', { row })
    /*if (output._type === "suggestion") {
      row = <SuggestionRow {...props} />;
    } else {
      row = <ResultRow {...props} />;
    }*/

    row = output._type != "suggestion" && <ResultRow {...props} />;

    return row ? (
      <div key={key} style={style}>
        {row}
      </div>
    ) : (
      undefined
    );
  }

  render() {
    const {
      outputs,
      deregisterHotKeys,
      registerHotKeys,
      focused,
      onFeedbackButtonClick,
      isAuthenticated,
      forceFullHeight,
      highlightedOutputItem,
      updatedResultItem,
      searchingInFlight
    } = this.props;
    try {
      const height = forceFullHeight
        ? RESULT_HEIGHT * MAX_VISIBLE_RESULTS
        : Math.min(RESULT_HEIGHT * MAX_VISIBLE_RESULTS, outputs.length * RESULT_HEIGHT);
      const shouldDisplayItemActions =
        highlightedOutputItem && highlightedOutputItem._type !== "suggestion";

      return (
        <div>
          {outputs.length > 0 && (
            <div className={cn(styles.resultsListWrapper)}>
              <div className={cn(styles.resultsList)}>
                <List
                  rowCount={outputs.length}
                  rowHeight={this.getRowHeight}
                  rowRenderer={this.rowRenderer}
                  width={CONTENT_VISIBLE_WIDTH}
                  height={height}
                  overscanRowCount={2}
                  ref={c => (this._list = c)}
                  scrollToIndex={this.props.highlightedOutputIndex}
                  tabIndex={null}
                  className={
                    process.platform === "win32" ? styles.resultsListNoScroll : styles.resultsList
                  }
                  updatedResultItem={updatedResultItem} // List can be forced to re-render if the updatedResultItem changed due to  user action
                />
              </div>

              <div className={cn(styles.resultsListStatus)}>
                <div className={styles.resultsListActionsWrapper}>
                  <ActionsBar
                    actions={this.resultsListActions}
                    registerHotKeys={registerHotKeys}
                    deregisterHotKeys={deregisterHotKeys}
                    isActivated={focused}
                    hotKeysCategory="resultsList"
                    className="resultsListActions"
                    invisible={shouldDisplayItemActions}
                  />

                  {shouldDisplayItemActions && (
                    <ActionsBar
                      actions={highlightedOutputItem.actions}
                      registerHotKeys={registerHotKeys}
                      deregisterHotKeys={deregisterHotKeys}
                      isActivated={focused}
                      hotKeysCategory="selectedItemActions"
                      className="resultsListActions"
                      targetOutputItem={highlightedOutputItem}
                    />
                  )}
                </div>
                {isAuthenticated && (
                  <div className={styles.feedbackButtonWrapper}>
                    <button className={styles.feedbackButton} onClick={onFeedbackButtonClick}>
                      {`${feedbackMessage} (${shortcutKey}F)`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    } catch (err) {
      logger.error("Erro render", { err });
    }
  }
}

OutputsList.propTypes = {
  outputs: PropTypes.array,
  mainInputFocused: PropTypes.bool,
  focused: PropTypes.bool,
  registerHotKeys: PropTypes.func,
  deregisterHotKeys: PropTypes.func,
  highlightedOutputItem: PropTypes.object,
  highlightedOutputIndex: PropTypes.number,
  outputActions: PropTypes.object,
  results: PropTypes.array,
  visibleSuggestions: PropTypes.array,
  onFeedbackButtonClick: PropTypes.func,
  isAuthenticated: PropTypes.bool,
  forceFullHeight: PropTypes.bool
};

function mapStateToProps(state) {
  return {
    highlightedOutputItem: state.output.highlightedOutputItem,
    highlightedOutputIndex: state.output.highlightedOutputIndex,
    updatedResultItem: state.output.updatedResultItem,
    results: state.output.results,
    visibleSuggestions: state.output.visibleSuggestions,
    outputs: state.output.outputs,
    searchingInFlight: state.search.searchingInFlight
  };
}

export default connect(mapStateToProps)(OutputsList);
