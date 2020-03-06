"use strict";
import React, { Component } from "react";
import PropTypes from "prop-types";
import ResourceIcon, { IconsCollection } from "../../../ResourceIcon";
import iconStyles from "../../../Icon/styles.css";
import styles from "./styles.css";
import cn from "classnames";
import Logger from "../../../../../lib/logger";
import ActionsBar from "../../../ActionsBar";

const logger = new Logger("SuggestionRow");

const keyMap = {
  trigger: "enter"
};

const keyMapId = "suggestionList";

class SuggestionRow extends Component {
  constructor(props) {
    super(props);
  }

  //({label, suggestionGroup, onMouseEnter, onMouseClick, selected}) {
  render() {
    const {
      onMouseClick,
      onMouseOver,
      selected,
      label,
      registerHotKeys,
      deregisterHotKeys,
      focused
    } = this.props;
    const actions = [
      {
        name: "select",
        keys: "enter",
        fn: event => {
          onMouseClick(event);
        }
      }
    ];

    return (
      <div>
        <button
          onClick={onMouseClick}
          onMouseOver={onMouseOver}
          className={cn(styles.suggestionItemWrapper, selected && styles.selected)}
        >
          <div className={styles.suggestIconWrapper}>
            <ResourceIcon className={iconStyles.iconSuggestionItem} icon={IconsCollection.search} />
          </div>
          {label}
        </button>
        {selected && (
          <ActionsBar
            hotKeysCategory="selectedSuggestionActions"
            actions={actions}
            registerHotKeys={registerHotKeys}
            deregisterHotKeys={deregisterHotKeys}
            invisible={true}
            isActivated={true}
          />
        )}
      </div>
    );
  }
}

SuggestionRow.propTypes = {
  label: PropTypes.string,
  value: PropTypes.object,
  selected: PropTypes.bool,
  onMouseOver: PropTypes.func,
  onMouseClick: PropTypes.func,
  registerHotKeys: PropTypes.func,
  deregisterHotKeys: PropTypes.func,
  focused: PropTypes.bool
};

export default SuggestionRow;
