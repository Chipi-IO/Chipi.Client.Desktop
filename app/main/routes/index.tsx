import React, { Component } from "react";
import { Route, Switch } from "react-router"; /* react-router v4/v5 */
import { ConnectedRouter } from "connected-react-router";
import MainSearch from "./mainSearch";
import FullThread from "./fullThread";
import Settings from "./settings";
import { HotKeys } from "react-hotkeys";
import hotKeysHelper from "@app/lib/hotKeysHelper";
import { chipiAnalytics } from "@app/lib/chipi";
import { ipcRenderer, remote } from "electron";
import List from "collections/list";
import styles from "./styles.css";
import animation from "./animation.css";
import ActionsBar from "@app/main/components/ActionsBar";
import { History, Location } from "history";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { toggleOff } from "@app/main/createWindow/toggleWindow";
import cn from "classnames";
import Transitions from "./transitions";

interface IRoutesProps {
  history: History<any>;
}

interface IRoutesState {
  hotKeysCollection: any;
  hotKeys: any;
}

class Routes extends React.Component<IRoutesProps, IRoutesState> {
  constructor(props: IRoutesProps) {
    super(props);

    this.state = {
      hotKeysCollection: new List(),
      hotKeys: {}
    };

    this.cleanup = this.cleanup.bind(this);
    this.registerHotKeys = this.registerHotKeys.bind(this);
    this.deregisterHotKeys = this.deregisterHotKeys.bind(this);
    this.updateHotKeysState = this.updateHotKeysState.bind(this);
    this.openFeedbackWindow = this.openFeedbackWindow.bind(this);
    this.hideWindow = this.hideWindow.bind(this);

    // Cleanup event listeners on unload
    // NOTE: when page refreshed (location.reload) componentWillUnmount is not called
    window.addEventListener("beforeunload", this.cleanup);
  }

  private routerActions = [
    {
      name: "reload window",
      keys: "CmdOrCtrl+r",
      fn: (event: any) => {
        ipcRenderer.send("reloadWindows");
      }
    },
    {
      name: "open feedback",
      keys: "CmdOrCtrl+f",
      fn: (event: any) => {
        this.openFeedbackWindow();
      }
    }
  ];

  private electronWindow = remote.getCurrentWindow();
  private transitAnimation = { ...animation };

  /**
   * Register hotkeys
   * @param {String} id
   * @param {*} keyMap
   * @param {*} handlers
   */
  registerHotKeys(id: string, keyMap: object, handlers: object) {
    const newHotKeyCollection = hotKeysHelper.addHotKeys(
      id,
      keyMap,
      handlers,
      this.state.hotKeysCollection
    );
    this.updateHotKeysState(newHotKeyCollection);
  }

  /**
   * Deregister hotkeys, child components use this function to remove their registered hostkeys
   * TODO: Implement custom compont to manage the deregistration automatically
   * @param {*} id
   */
  deregisterHotKeys(id: string) {
    const newHotKeyCollection = hotKeysHelper.deleteHotKeys(id, this.state.hotKeysCollection);
    this.updateHotKeysState(newHotKeyCollection);
  }

  /**
   * Update hot keys stat value from the hot keys collection. The collection has to be FIFO like queue.
   */
  updateHotKeysState(hotKeysCollection: any) {
    let finalHotKeys: any = hotKeysHelper.buildFinalHotKeys(hotKeysCollection);
    this.setState({
      hotKeysCollection,
      hotKeys: {
        keyMap: finalHotKeys.keyMap,
        handlers: finalHotKeys.handlers
      }
    });
  }

  openFeedbackWindow() {
    chipiAnalytics.addNewEvent("client.navigate.feedback");

    ipcRenderer.send("openFeedbackWindow");
  }

  hideWindow() {
    toggleOff(this.electronWindow);
  }

  componentWillUnmount() {
    this.cleanup();
  }

  cleanup() {
    window.removeEventListener("beforeunload", this.cleanup);
  }

  componentDidMount() {}

  render() {
    return (
      <ConnectedRouter history={this.props.history}>
        <div
          className={cn(styles.outerContainer, styles[process.platform])}
          data-automationid="outerContainer"
        >
          <HotKeys
            keyMap={this.state.hotKeys.keyMap}
            handlers={this.state.hotKeys.handlers}
            focused
            style={{ outline: "none" }}
          >
            <ActionsBar
              actions={this.routerActions}
              registerHotKeys={this.registerHotKeys}
              deregisterHotKeys={this.deregisterHotKeys}
              isActivated={true}
              hotKeysCategory="topRoutes"
              className="topRoutesActions"
              invisible={true}
            />
            <Route
              render={() => {
                const location = this.props.history.location;
                return (
                  <Transitions pageKey={location.key} {...location.state}>
                    <Switch location={location}>
                      <Route
                        exact
                        path="/full-thread"
                        render={props => (
                          <FullThread
                            {...props}
                            registerHotKeys={this.registerHotKeys}
                            deregisterHotKeys={this.deregisterHotKeys}
                          />
                        )}
                      />
                      <Route exact path="/settings" render={props => <Settings {...props} />} />
                      <Route
                        exact
                        path="/"
                        render={props => (
                          <MainSearch
                            {...props}
                            registerHotKeys={this.registerHotKeys}
                            deregisterHotKeys={this.deregisterHotKeys}
                            hideWindow={this.hideWindow}
                            openFeedbackWindow={this.openFeedbackWindow}
                          />
                        )}
                      />
                    </Switch>
                  </Transitions>
                );
              }}
            ></Route>
          </HotKeys>
          <div
            className={styles.transparentHelper}
            onClick={() => {
              this.hideWindow();
            }}
            tabIndex={-1}
          />
        </div>
      </ConnectedRouter>
    );
  }
}

export default Routes;
