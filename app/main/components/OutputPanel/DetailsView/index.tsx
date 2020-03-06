import React, { Component, Ref } from "react";
import PropTypes from "prop-types";
import Logger from "../../../../lib/logger";
import styles from "./styles.css";
import ActionsBar from "../../ActionsBar";
import PreviewContent from "./PreviewContent";
import ResultIcon from "../ResultIcon";
import HeaderLine from "../HeaderLine";
import PreviewHeader from "../PreviewHeader";

const logger = new Logger("components.OutputPanel.DetailsView");

interface IDetailsViewProps {
  hideDetailsView: Function;
  focused: Boolean;
  detailsItem: any;
  detailsViewActions: any;
  registerHotKeys: any;
  deregisterHotKeys: any;
}

interface IDetailsViewStats {
  selectedActionIndex?: number;
  selectedAction?: any;
}

export default class DetailsView extends Component<IDetailsViewProps, IDetailsViewStats> {
  private _detailsViewNavigationActions: any[];
  private _detailsWrapperRef: Ref<HTMLDivElement>;

  constructor(props) {
    super(props);

    this.renderDetailsHeader = this.renderDetailsHeader.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
    this.moveCursor = this.moveCursor.bind(this);
    this.normalizeSelection = this.normalizeSelection.bind(this);

    this._detailsWrapperRef = React.createRef();

    this._detailsViewNavigationActions = [
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
        name: "return to results",
        keys: "left",
        fn: event => {
          this.props.hideDetailsView();
          event.preventDefault();
        }
      }
    ];

    this.state = {
      selectedAction: null,
      selectedActionIndex: -1
    };
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.detailsItem !== this.props.detailsItem ||
      prevProps.focused !== this.props.focused
    ) {
      this.setState({
        selectedAction: null,
        selectedActionIndex: -1
      });
    }
  }

  /**
   * Move the cursor for output list
   * @param {*} offset
   */
  moveCursor(offset) {
    const { selectedActionIndex } = this.state;
    const { detailsViewActions } = this.props;

    let numberOfActions = detailsViewActions.length;

    let newSelectedActionIndex = selectedActionIndex + offset;

    newSelectedActionIndex = this.normalizeSelection(newSelectedActionIndex, numberOfActions);

    const selectedAction = detailsViewActions[newSelectedActionIndex];

    this.setState({
      selectedAction,
      selectedActionIndex: newSelectedActionIndex
    });
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
    } else if (index < -1) {
      return length - 1; // loop back to bottom of list
    }
    return index;
  }

  renderDetailsHeader() {
    const { detailsItem } = this.props;

    if (!detailsItem) {
      return;
    }

    const channelInfo = detailsItem.chipi ? detailsItem.chipi.channel : null;
    const tunnelInfo = detailsItem.chipi ? detailsItem.chipi.tunnel : null;

    return (
      <div className={styles.detailsHeaderWrapper}>
        <div>
          <ResultIcon icon={detailsItem.icon} size="small" className={styles.channelIcon} />
        </div>
        {channelInfo && (
          <HeaderLine
            channelInfo={channelInfo}
            tunnelInfo={tunnelInfo}
            className="detailsView"
            title={detailsItem.breadcrumbTitle}
          />
        )}

        {!channelInfo && (
          <div className={styles.pluginInfo}>
            <div className={styles.pluginName}>{detailsItem.plugin}</div>
          </div>
        )}
      </div>
    );
  }

  renderPreview() {
    const { detailsItem } = this.props;

    if (!detailsItem) {
      return;
    }

    return (
      <div className={styles.previewWrapper}>
        <div className={styles.preivewHeaderWrapper}>
          <PreviewHeader detailsItem={detailsItem} />
        </div>
        <div className={styles.preivewContentWrapper}>
          <PreviewContent key={detailsItem.id} previewItem={detailsItem} />
        </div>
      </div>
    );
  }

  render() {
    const {
      registerHotKeys,
      deregisterHotKeys,
      detailsViewActions,
      focused,
      detailsItem
    } = this.props;

    const { selectedAction } = this.state;

    return (
      detailsItem && (
        <div className={styles.cardWrapper} ref={this._detailsWrapperRef}>
          <div className={styles.detailsWrapper}>
            {this.renderDetailsHeader()}
            {this.renderPreview()}
          </div>
          <div className={styles.actionsWrapper}>
            <ActionsBar
              actions={detailsViewActions}
              registerHotKeys={registerHotKeys}
              deregisterHotKeys={deregisterHotKeys}
              isActivated={focused}
              hotKeysCategory="detailsView"
              className="detailsView"
              selectedAction={selectedAction}
              targetOutputItem={detailsItem}
              invisible={false}
              //getCursorSelection={}
            />

            <ActionsBar
              actions={this._detailsViewNavigationActions}
              registerHotKeys={registerHotKeys}
              deregisterHotKeys={deregisterHotKeys}
              isActivated={focused}
              hotKeysCategory="detailsViewNavigation"
              invisible={true}
            />
          </div>
        </div>
      )
    );
  }
}
