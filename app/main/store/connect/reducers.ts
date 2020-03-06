import {
  IConnectState,
  ConnectActionTypes,
  CONNECTS_LOADED,
  FIXING_CONNECT_CLICKED
} from "./types";
import { send } from "@app/lib/rpc";
import Logger from "@app/lib/logger";
import { chipiUserData } from "@app/lib/chipi";

const logger = new Logger("store.connect.reducers");
//Available authState: signIn, signUp, confirmSignIn, confirmSignUp, forgotPassword, verifyContact, signedIn

const initialState: IConnectState = {
  inactivatedConnects: [],
  fixingConnectClickedAt: 0
};

export function connectReducer(state = initialState, action: ConnectActionTypes): IConnectState {
  switch (action.type) {
    case CONNECTS_LOADED:
      const { connects = [] } = action.payload;

      const inactivatedConnects = connects.filter(connect => !connect.isActive);

      return {
        ...state,
        inactivatedConnects:
          Date.now() - state.fixingConnectClickedAt > 600000 ? inactivatedConnects : null // If user clicked the fixing connect button within 10 minutes, then we don't want to display the inactivatedConnects
      };
    case FIXING_CONNECT_CLICKED:
      logger.verbose("FIXING_CONNECT_CLICKED reducer called");
      return {
        ...state,
        fixingConnectClickedAt: Date.now(),
        inactivatedConnects: null
      };
    default:
      return state;
  }
}
