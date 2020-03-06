import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import styles from "./styles.css";
import Logger from "../../../lib/logger";
import ActionsBar from "../ActionsBar";
import * as magicFilterSuggestionActions from "../../actions/magicFilterSuggestion";
import cn from "classnames";

const logger = new Logger("components.magicFilterSuggestion");

class MagicFilterSuggestion extends Component {
  constructor(props) {
    super(props);

    this.closeSuggestion = this.closeSuggestion.bind(this);
    this.normalizeSelection = this.normalizeSelection.bind(this);
    this.highlightSuggestion = this.highlightSuggestion.bind(this);
    this.moveCursor = this.moveCursor.bind(this);
    this.selectSuggestion = this.selectSuggestion.bind(this);

    this.highlightedFilterRef = React.createRef();
    this.magicFilterItemContainerRef = React.createRef();

    this.state = {
      scrollOffset: 0
    };

    this.suggestionActions = [
      {
        name: "close suggestion",
        keys: "esc",
        fn: event => {
          this.closeSuggestion();
          event.preventDefault();
        }
      },
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
      },
      {
        name: "add magic filter",
        keys: "enter",
        fn: event => {
          if (!this.selectSuggestion()) {
            this.closeSuggestion();
          }
          event.preventDefault();
        }
      },
      {
        name: "add magic filter with right",
        keys: ["right", "tab"],
        fn: event => {
          if (this.props.highlightedSuggestionIndex > -1) {
            this.selectSuggestion();
            event.preventDefault();
          }
        }
      }
    ];
  }

  closeSuggestion() {
    this.props.magicFilterSuggestionActions.hideMagicFilterSuggestion();
  }

  componentDidUpdate(prevProps) {
    if (!this.props.isVisible || !this.props.magicFilterSuggestion) {
      return;
    }

    // The first magic filter item should be highlighted automatically
    if (
      this.props.magicFilterSuggestion.items.length > 0 &&
      this.props.highlightedSuggestionIndex == -1
    ) {
      this.highlightSuggestion(0);
    }

    // Need to update the suggestion scroll position if the highlighted suggestion is different
    if (
      prevProps.highlightedSuggestionIndex !== this.props.highlightedSuggestionIndex &&
      this.magicFilterItemContainerRef &&
      this.magicFilterItemContainerRef.current
    ) {
      let scrollTop = 0;

      if (this.props.highlightedSuggestionIndex != -1) {
        scrollTop = this.magicFilterItemContainerRef.current.scrollTop;

        // Calculate the item container viewable bottom Y position.
        const itemContainerViewableBottomY =
          this.magicFilterItemContainerRef.current.clientHeight +
          this.magicFilterItemContainerRef.current.scrollTop;

        // Calculate the bootom position of the highlighted filter item relative to the item container
        const highlightFilterBottomY =
          (this.highlightedFilterRef &&
            this.highlightedFilterRef.current.offsetTop +
              this.highlightedFilterRef.current.clientHeight) ||
          0;

        const highlightFilterTopY =
          (this.highlightedFilterRef && this.highlightedFilterRef.current.offsetTop) - 10 || 0; //The filter offsettop somehow has some padding at the top, we need to delete it when calculating the top Y

        if (scrollTop >= highlightFilterTopY) {
          // The highlighted item is above scroll position
          scrollTop = highlightFilterTopY;
        } else if (highlightFilterBottomY > itemContainerViewableBottomY) {
          // The highlighted item is underneath the viewable area
          scrollTop = scrollTop + highlightFilterBottomY - itemContainerViewableBottomY;
        }
      }
      this.magicFilterItemContainerRef.current.scrollTop = scrollTop;
    }
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
      return 0;
    } else if (index < 0) {
      return length - 1; // loop back to bottom of list
    }
    return index;
  }

  /**
   * Move the cursor for output list
   * @param {*} offset
   */
  moveCursor(offset) {
    logger.verbose("Magic filter suggestion cursor moving", { offset });

    let numberOfSuggestions = this.props.magicFilterSuggestion.items.length;

    let highlightedSuggestionIndex = this.props.highlightedSuggestionIndex;

    highlightedSuggestionIndex += offset;

    highlightedSuggestionIndex = this.normalizeSelection(
      highlightedSuggestionIndex,
      numberOfSuggestions
    );

    this.highlightSuggestion(highlightedSuggestionIndex);
  }

  /**
   *
   * @param {*} highlightedOutputIndex
   */
  highlightSuggestion(highlightedSuggestionIndex) {
    const { magicFilterSuggestion } = this.props;

    let highlightedMagicFilter;

    if (highlightedSuggestionIndex > -1) {
      highlightedMagicFilter = magicFilterSuggestion.items[highlightedSuggestionIndex];
    }

    this.props.magicFilterSuggestionActions.highlightMagicFilterSuggestionItem(
      highlightedSuggestionIndex,
      highlightedMagicFilter
    );
  }

  /**
   * Select the highlighted magic filter suggestion
   */
  selectSuggestion() {
    const {
      highlightedSuggestionIndex,
      magicFilterSuggestion,
      magicFilterSuggestionActions
    } = this.props;

    if (highlightedSuggestionIndex < 0) {
      return false;
    }

    const highlightedSuggestionItem = magicFilterSuggestion.items[highlightedSuggestionIndex];

    if (!highlightedSuggestionItem) {
      logger.error("Failed to get magic filter form magic filter suggestion", {
        highlightedSuggestionIndex
      });
    }

    // If the match term is same to the highlighted suggestion item lable, we don't call the addMagicFilter again
    if (highlightedSuggestionItem.match.matchTerm != highlightedSuggestionItem.label) {
      magicFilterSuggestionActions.addMagicFilter(highlightedSuggestionItem);
    }

    return true;
  }

  render() {
    const {
      term,
      magicFilterSuggestion,
      registerHotKeys,
      deregisterHotKeys,
      highlightedSuggestionIndex,
      isVisible
    } = this.props;

    logger.debug("Magic filter suggestion", { magicFilterSuggestion });

    return (
      <div>
        {isVisible && (
          <div className={styles.magicFilterSuggestionPositionHelper}>
            <div className={styles.magicFilterSuggestionWrapper}>
              <div className={styles.magicFilterSuggestionList}>
                <div
                  ref={this.magicFilterItemContainerRef}
                  className={styles.magicFilterItemsContainer}
                >
                  {magicFilterSuggestion.items.map((magicFilterItem, i) => {
                    logger.verbose("Incoming magic filter item", { term, magicFilterItem });

                    return (
                      <div
                        key={i}
                        className={cn(
                          styles.magicFilterItem,
                          i === highlightedSuggestionIndex && styles.highligthed
                        )}
                        ref={i === highlightedSuggestionIndex && this.highlightedFilterRef}
                        // Move selection to item under cursor

                        onMouseOver={event => {
                          const { highlightedOutputIndex } = this.props;
                          const { movementX, movementY } = event.nativeEvent;
                          logger.verbose("Mouse over magic filter", { i, movementX, movementY });

                          if (i === highlightedOutputIndex) {
                            return false;
                          }

                          if (movementX || movementY) {
                            // Hover item only when we had real movement from mouse
                            // We should prevent changing of selection when user uses keyboard
                            this.highlightSuggestion(i);
                          }
                        }}
                        onClick={event => {
                          this.selectSuggestion();
                          event.preventDefault();
                        }}
                      >
                        <div className={styles.magicFilterItemValue}>{magicFilterItem.label}</div>
                        {magicFilterItem.description && (
                          <div className={styles.magicFilterItemDescription}>
                            {magicFilterItem.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <ActionsBar
                actions={this.suggestionActions}
                registerHotKeys={registerHotKeys}
                deregisterHotKeys={deregisterHotKeys}
                isActivated={true}
                hotKeysCategory="migicFilterSuggestion"
                className="resultsListActions"
                invisible={true}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

MagicFilterSuggestion.propTypes = {
  term: PropTypes.string,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  name: PropTypes.string,
  magicFilterSuggestion: PropTypes.object,
  registerHotKeys: PropTypes.func,
  deregisterHotKeys: PropTypes.func,
  highlightedSuggestionIndex: PropTypes.number
};

function mapStateToProps(state) {
  return {
    highlightedSuggestionIndex: state.magicFilter.highlightedSuggestionIndex,
    magicFilterSuggestion: state.magicFilter.magicFilterSuggestion,
    isVisible:
      state.magicFilter.magicFilterSuggestion &&
      state.magicFilter.magicFilterSuggestion.items.length > 0
  };
}

function mapActionsToProps(dispatch) {
  return {
    magicFilterSuggestionActions: bindActionCreators(magicFilterSuggestionActions, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapActionsToProps
)(MagicFilterSuggestion);
