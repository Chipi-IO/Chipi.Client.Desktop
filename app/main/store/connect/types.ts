export const CONNECTS_LOADED = "CONNECTS_LOADED";
export const FIXING_CONNECT_CLICKED = "FIXING_CONNECT_CLICKED";

export interface IConnectState {
  inactivatedConnects?: any;
  /**
   * The epoch milliseconds when was the fixing connect button clicked
   */
  fixingConnectClickedAt?: number;
}

export type ConnectsLoadedAction = {
  type: typeof CONNECTS_LOADED;
  payload: {
    connects: any[];
  };
};

export type FixingConnectClickedAction = {
  type: typeof FIXING_CONNECT_CLICKED;
};

export type ConnectActionTypes = ConnectsLoadedAction | FixingConnectClickedAction;
