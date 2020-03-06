"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "./styles.css";
import Logger from "../../../lib/logger";
import { chipiAnalytics } from "../../../lib/chipi";
import cn from "classnames";

const logger = new Logger("component.actionsBar");

const shortcutKey = process.platform === "darwin" ? "⌘" : "Ctrl";
const preservedKeys = {
  left: "◀",
  right: "▶",
  up: "▲",
  down: "▼"
};

const mapKey = key => {
  if (key === "CmdOrCtrl") {
    return shortcutKey;
  }

  if (preservedKeys[key]) {
    return preservedKeys[key];
  }

  return key;
};

const defaultHotKeysCategory = "itemActions";

interface IActionsBarProps {
  registerHotKeys: any;
  deregisterHotKeys: any;
  hotKeysCategory: any;
  isActivated: Boolean;
  actions: any[];
  targetOutputItem?: any;
  selectedAction?: any;
  invisible: Boolean;
  className?: string;
}

interface IActionsBarStats {
  triggeredAction: any;
  selectedAction: any;
}

class ActionsBar extends Component<IActionsBarProps, IActionsBarStats> {
  private _mounted: Boolean;

  constructor(props: IActionsBarProps) {
    logger.verbose("Action bar render called");

    super(props);

    this.sendActionAnalyticsEvent = this.sendActionAnalyticsEvent.bind(this);
    this.resetActionsHotkeys = this.resetActionsHotkeys.bind(this);
    this.onActionClicked = this.onActionClicked.bind(this);
    this.handleActionTriggering = this.handleActionTriggering.bind(this);
    this.onActionHover = this.onActionHover.bind(this);

    this.state = {
      triggeredAction: null,
      selectedAction: null
    };
  }

  /**
   * Handle the action trggering event. Action can be triggered by hotkeys and mouse click
   * @param {*} event The original DOM event
   * @param {*} action The action has being triggered
   */
  handleActionTriggering(event, action) {
    this.sendActionAnalyticsEvent(action.name, action.keys);

    // Check if the action need to be ignored due the cursor selection
    if (action.ignoreWhenTextHighlighted) {
      const windowSelection = window.getSelection();
      let highlightExists = false;

      if (windowSelection.rangeCount > 0) {
        const selectionRange = windowSelection.getRangeAt(0);

        // If the selection range endOffset not equal to startOffset, then the highlight exists
        highlightExists = selectionRange.endOffset !== selectionRange.startOffset;
      }

      if (highlightExists) {
        logger.verbose("Action ignored due to ignoreWhenWindowSelection");

        return;
      }
    }

    action.fn(event);

    logger.verbose("Has event prevented", { eventPrevented: event.defaultPrevented });

    if (this._mounted) {
      this.setState(
        {
          triggeredAction: action
        },
        () => {
          const self = this;
          setTimeout(() => self._mounted && self.setState({ triggeredAction: null }), 200);
        }
      );
    }
  }

  /**
   *
   * @param {*} actionName
   * @param {*} actionKeys
   */
  sendActionAnalyticsEvent(actionName, actionKeys) {
    const { targetOutputItem } = this.props;

    if (targetOutputItem) {
      chipiAnalytics.addNewEvent(
        `search.result.action`,
        targetOutputItem && {
          id: targetOutputItem.id,
          title: targetOutputItem.title,
          plugin: targetOutputItem.plugin,
          displayPosition: targetOutputItem.displayPosition,
          searchedTerm: targetOutputItem.searchedTerm
        },
        { name: actionName, triggeredKeys: actionKeys }
      );
    }
  }

  /**
   * Reset actions registeration. For the root component to track the hotkeys short cut
   * @param {*} forceUnmount
   */
  resetActionsHotkeys(forceUnmount) {
    const {
      registerHotKeys,
      deregisterHotKeys,
      hotKeysCategory,
      isActivated,
      actions
    } = this.props;

    const { selectedAction } = this.state;

    const actionsCategoryName = hotKeysCategory || defaultHotKeysCategory;

    logger.verbose("Reset actions called", {
      actionsCategoryName,
      isActivated,
      forceUnmount
    });

    if (!actions || !isActivated || forceUnmount) {
      deregisterHotKeys(actionsCategoryName);
      return;
    }

    const normalizeKeys = originalKeys => {
      let keys = Array.isArray(originalKeys) ? originalKeys : [originalKeys];

      return keys.map(key => {
        return key.replace("CmdOrCtrl", process.platform === "darwin" ? "command" : "ctrl");
      });
    };

    let keyMap = {},
      handlers = {};

    actions.map(action => {
      if (action.name && action.keys && action.fn) {
        keyMap[action.keys] = normalizeKeys(action.keys);
        handlers[action.keys] = event => {
          this.handleActionTriggering(event, action);
        };
      } else {
        logger.warn("Action doesn't have requried properties", { action });
      }
    });

    if (selectedAction) {
      if (selectedAction.name && selectedAction.keys && selectedAction.fn) {
        const overrideActionName = `${selectedAction.name}-enterKey`;
        keyMap["enter"] = "enter";
        handlers["enter"] = event => {
          this.handleActionTriggering(event, selectedAction);
          event.preventDefault();
        };
      }
    }

    logger.debug("Start registering actions from actions bar", {
      actionsCategoryName,
      keyMap
    });

    registerHotKeys(actionsCategoryName, keyMap, handlers);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.actions !== this.props.actions ||
      prevProps.targetOutputItem !== this.props.targetOutputItem ||
      prevProps.isActivated !== this.props.isActivated ||
      prevProps.selectedAction !== this.props.selectedAction
    ) {
      this.setState(
        {
          selectedAction: this.props.isActivated ? this.props.selectedAction : null
        },
        () => {
          this.resetActionsHotkeys(false);
        }
      );
    }
  }

  componentDidMount() {
    this._mounted = true;

    this.resetActionsHotkeys(false);
  }

  componentWillUnmount() {
    this._mounted = false;

    this.resetActionsHotkeys(true);
  }

  onActionClicked(event, action) {
    this.handleActionTriggering(event, action);
  }

  onActionHover(event, action) {
    this.setState(
      {
        selectedAction: action
      },
      () => {
        this.resetActionsHotkeys(false);
      }
    );
  }

  render() {
    const { invisible, className, actions } = this.props;
    const { triggeredAction, selectedAction } = this.state;

    if (invisible) {
      return <div />;
    }

    return (
      <div className={cn(styles[className])}>
        {" "}
        {actions &&
          actions.map((action, i) => (
            <span
              className={cn(
                styles.actions,
                selectedAction && selectedAction.name === action.name && styles.actionSelected,
                triggeredAction && action.name === triggeredAction.name && styles.actionTriggered
              )}
              key={i}
              onMouseOver={event => {
                this.onActionHover(event, action);
              }}
              onClick={event => {
                this.onActionClicked(event, action);
              }}
            >
              <span className={styles.actionKey}>
                {action.keys.split("+").map((key, index) => {
                  return (
                    <div
                      key={key}
                      className={cn(
                        styles.actionKeyElement,
                        index > 0 && styles.actionKeyElementMore
                      )}
                    >
                      {mapKey(key)}
                    </div>
                  );
                })}
              </span>
              <span className={styles.actionLongName}>
                {action.longName ? action.longName : action.name}
              </span>
              <span className={styles.actionName}>{action.name.toLowerCase()}</span>
            </span>
          ))}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(ActionsBar);
