import * as React from "react";
import { connect } from "react-redux";
import { AppState } from "@app/main/store";
import { goToRoute } from "@app/main/actions/appRoute";
import { remote } from "electron";
import Logo from "@app/main/components/Logo";
import PreviewHeader from "@app/main/components/OutputPanel/PreviewHeader";
import { Collapse } from "react-bootstrap";

import "./styles.scss";
import ActionsBar from "@app/main/components/ActionsBar";
import HeaderLine from "@app/main/components/OutputPanel/HeaderLine";
import ResultIcon from "@app/main/components/OutputPanel/ResultIcon";
import * as commonStyles from "@app/main/components/Common/styles.css";
import cn from "classnames";

import { MAX_OUTPUT_HEIGHT, INPUT_HEIGHT } from "../../constants/ui";
import ResourceIcon, { IconsCollection } from "@app/main/components/ResourceIcon";
import Logger from "@app/lib/logger";
import { ISearchResultItem } from "@app/models/interfaces";
import fade from "../transitions/fade";

const logger = new Logger("component.Chipi");

interface IFullThreadProps {
  registerHotKeys: any;
  deregisterHotKeys: any;
  resultItem: ISearchResultItem;
  goToRoute: typeof goToRoute;
}

interface IFullThreadState {
  isLoading: boolean;
  isError: boolean;
  toggledItemsIds: any[];
  threadItems: ISearchResultItem[];
  focusedThreadItemId: string;
  resultItemFocusingDone: boolean;
}

interface IThreadItemsRefsCollection {
  [index: string]: HTMLDivElement;
}

class FullThread extends React.Component<IFullThreadProps, IFullThreadState> {
  private shortcutHelperRef: React.RefObject<HTMLInputElement>;
  private threadItemsRefsCollection: IThreadItemsRefsCollection;
  private fullConversationWrapperRef: React.RefObject<HTMLDivElement>;

  private electronWindow: Electron.BrowserWindow;

  constructor(props: IFullThreadProps) {
    super(props);
    this.electronWindow = remote.getCurrentWindow();

    this.goBack = this.goBack.bind(this);
    this.cleanup = this.cleanup.bind(this);
    this.onWindowShown = this.onWindowShown.bind(this);
    this.renderFullConversation = this.renderFullConversation.bind(this);
    this.scrollToThreadItem = this.scrollToThreadItem.bind(this);
    this.focusThreadItem = this.focusThreadItem.bind(this);
    this.onThreadItemFocused = this.onThreadItemFocused.bind(this);
    this.fixFocusedItemViewPoint = this.fixFocusedItemViewPoint.bind(this);
    this.scrollVeritical = this.scrollVeritical.bind(this);

    this.shortcutHelperRef = React.createRef();
    this.fullConversationWrapperRef = React.createRef();
    this.threadItemsRefsCollection = {};

    this.electronWindow.on("show", this.onWindowShown);

    if (!props.resultItem || !props.resultItem.fullConversation) {
      this.goBack();
    }

    this.state = {
      isLoading: true,
      isError: false,
      toggledItemsIds: [this.props.resultItem.id],
      threadItems: null,
      resultItemFocusingDone: false,
      focusedThreadItemId: null
    };
  }

  private fullThreadActions = [
    {
      name: "fullThreadReset",
      keys: "esc",
      fn: (event: any) => {
        logger.verbose("Esc pressed");

        const { focusedThreadItemId } = this.state;

        if (
          focusedThreadItemId &&
          this.threadItemsRefsCollection[focusedThreadItemId] !== document.activeElement
        ) {
          // If focusedThreadItemId exists but the child element of the thread item such as links focused, we want to
          // toggle the thread item and focus the thread item again.
          this.toggleItem(this.state.focusedThreadItemId);
          this.threadItemsRefsCollection[focusedThreadItemId].focus();
        } else {
          this.goBack();
        }

        event.preventDefault();
      }
    },
    {
      name: "scrollUp",
      keys: "up",
      fn: (event: any) => {
        logger.verbose("Esc pressed");
        this.scrollVeritical(-20);
        event.preventDefault();
      }
    },
    {
      name: "scrollDown",
      keys: "down",
      fn: (event: any) => {
        logger.verbose("Esc pressed");
        this.scrollVeritical(20);
        event.preventDefault();
      }
    },
    {
      name: "toggleThreadItem",
      keys: "enter",
      fn: (event: any) => {
        const { focusedThreadItemId } = this.state;

        if (
          focusedThreadItemId &&
          this.threadItemsRefsCollection[focusedThreadItemId] === document.activeElement
        ) {
          this.toggleItem(this.state.focusedThreadItemId);
        }
      }
    }
  ];

  async componentDidMount() {
    const { resultItem } = this.props;

    this.shortcutHelperRef.current && this.shortcutHelperRef.current.focus();

    try {
      const threadItems = await resultItem.fullConversation.conversationItems();

      this.setState({
        isLoading: false,
        threadItems
      });

      // focusing the  element
    } catch (err) {
      logger.error("Failed to load full thread items", { err });
      this.setState({
        isLoading: false,
        isError: true
      });
    }
  }

  componentDidUpdate(prevProps: IFullThreadProps, prevState: IFullThreadState) {
    if (prevState.isLoading !== this.state.isLoading && !this.state.resultItemFocusingDone) {
      //this.scrollToThreadItem(this.props.resultItem.id);
      this.focusThreadItem(this.props.resultItem.id, false);
      this.setState({
        resultItemFocusingDone: true
      });
    }
  }

  scrollToThreadItem(resultItemId: string) {
    if (this.threadItemsRefsCollection[resultItemId]) {
      const resultItemPositionRect = this.threadItemsRefsCollection[
        resultItemId
      ].getBoundingClientRect();

      const fullConversationWrapperPositionRect = this.fullConversationWrapperRef.current.getBoundingClientRect();

      this.fullConversationWrapperRef.current.scrollTo(
        0,
        resultItemPositionRect.top -
          fullConversationWrapperPositionRect.top -
          Math.min(resultItemPositionRect.height / 5, 10) // leave some padding to the top of the targetd item
      );
    }
  }

  focusThreadItem(itemId: string, preventScroll?: boolean) {
    if (this.threadItemsRefsCollection[itemId]) {
      this.threadItemsRefsCollection[itemId].focus({
        preventScroll
      });
    }
  }

  onThreadItemFocused(e, itemId) {
    logger.verbose("Thread item focused");

    this.fixFocusedItemViewPoint(itemId);

    //debugger;
    this.setState({
      focusedThreadItemId: itemId
    });
  }

  fixFocusedItemViewPoint(threadItemId) {
    // Sometimes, the default scrolling behaviour is not always working perfect with the item.

    if (threadItemId && this.threadItemsRefsCollection[threadItemId] === document.activeElement) {
      const focusedItem = document.activeElement;

      const focusedItemPosistionTop = focusedItem.getBoundingClientRect().top;
      const focusedItemScrollTop = focusedItem.scrollTop;

      // If the current focued item scroll top to large. We need to re-scroll the winodw to the top of the focused item.
      if (focusedItemScrollTop > focusedItemPosistionTop + 20) {
        focusedItem.scrollIntoView(true);
      }
    }
  }

  scrollVeritical(offset) {
    this.fullConversationWrapperRef.current.scrollBy(0, offset);
  }

  componentWillUnmount() {
    this.cleanup();
  }

  onWindowShown() {
    this.shortcutHelperRef.current && this.shortcutHelperRef.current.focus();
  }

  cleanup() {
    this.electronWindow.removeListener("show", this.onWindowShown);
  }

  goBack() {
    const { goToRoute } = this.props;

    goToRoute("/", fade);
  }

  toggleItem(itemId: string) {
    const { toggledItemsIds } = this.state;

    if (toggledItemsIds.indexOf(itemId) > -1) {
      toggledItemsIds[toggledItemsIds.indexOf(itemId)] = null;
    } else {
      toggledItemsIds.push(itemId);
    }

    this.setState({
      toggledItemsIds: toggledItemsIds.filter(Boolean)
    });
  }

  renderFullConversation() {
    const { isLoading, isError, toggledItemsIds, threadItems, focusedThreadItemId } = this.state;
    const { resultItem } = this.props;

    if (isError) {
      return <div>There was an error</div>;
    }

    if (isLoading) {
      return (
        <div className="full-conversation-loading">
          <Logo isLoading={isLoading} />
        </div>
      );
    }

    const sortedItems = threadItems.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

    if (sortedItems && sortedItems.length) {
      console.log(sortedItems);
      return sortedItems.map((item, index) => {
        const itemIsToggled = toggledItemsIds.indexOf(item.id) > -1;
        const isFocused = focusedThreadItemId == item.id;
        return (
          <React.Fragment key={item.id}>
            <div
              ref={ref => {
                this.threadItemsRefsCollection[item.id] = ref;
                return true;
              }}
              key={item.id}
              className={`full-conversation-item-wrapper`}
              onMouseOver={event => {
                const { movementX, movementY } = event.nativeEvent;

                if (item.id === focusedThreadItemId) {
                  return false;
                }

                if (movementX || movementY) {
                  // Hover item only when we had real movement from mouse
                  // We should prevent changing of selection when user uses keyboard
                  this.focusThreadItem(item.id, true);
                }
              }}
              onFocus={e => {
                this.onThreadItemFocused(e, item.id);
              }}
              tabIndex={0}
            >
              <div className={`full-conversation-item  ${isFocused && "focused"}`}>
                <div
                  onClick={() => {
                    this.toggleItem(`${item.id}`);
                  }}
                  className={`item-header`}
                >
                  <PreviewHeader detailsItem={item} />
                  <div className="full-conversation-subject">{item.title}</div>
                  <span className={`toggle-arrow ${itemIsToggled ? "toggled" : ""}`} />
                </div>
                <Collapse in={itemIsToggled}>
                  <div className="full-conversation-content">
                    <div
                      className="full-conversation-body"
                      dangerouslySetInnerHTML={{ __html: item.htmlContent }}
                    />
                  </div>
                </Collapse>
              </div>
            </div>
          </React.Fragment>
        );
      });
    }
  }

  render() {
    const { resultItem, registerHotKeys, deregisterHotKeys } = this.props;

    if (!resultItem || !resultItem.fullConversation) {
      this.goBack();
    }

    const channelInfo = resultItem.chipi ? resultItem.chipi.channel : null;
    const tunnelInfo = resultItem.chipi ? resultItem.chipi.tunnel : null;

    return (
      <div
        style={{ height: MAX_OUTPUT_HEIGHT + INPUT_HEIGHT + 1 }}
        tabIndex={-1}
        className="full-thread-wrapper"
      >
        <ActionsBar
          actions={this.fullThreadActions}
          registerHotKeys={registerHotKeys}
          deregisterHotKeys={deregisterHotKeys}
          isActivated={true}
          hotKeysCategory="chipiFullThread"
          className="resultsListActions"
          invisible={true}
        />
        <input
          className="shortcut-key-helper"
          ref={this.shortcutHelperRef}
          autoFocus={true}
          tabIndex={-1}
        />
        <div className={cn("header")}>
          <div className={cn("header-title", commonStyles.draggable)}>
            <ResultIcon icon={resultItem.icon} size="xsmall" className="resultIcon" />
            <HeaderLine
              channelInfo={channelInfo}
              tunnelInfo={tunnelInfo}
              className="detailsView"
              title={resultItem.breadcrumbTitle || resultItem.title}
            />
          </div>
          <div className="header-close">
            <a
              href="#"
              onClick={() => {
                this.props.goToRoute("/", fade);
              }}
            >
              {/* 
                // @ts-ignore ignoring this for now*/}
              <ResourceIcon icon={IconsCollection.close} />
            </a>
          </div>
        </div>
        {resultItem && resultItem.fullConversation && (
          <div ref={this.fullConversationWrapperRef} className="full-conversation-wrapper">
            {this.renderFullConversation()}
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(appState: AppState) {
  return {
    resultItem: appState.fullThread.resultItem
  };
}

export default connect(
  mapStateToProps,
  { goToRoute }
)(FullThread);
