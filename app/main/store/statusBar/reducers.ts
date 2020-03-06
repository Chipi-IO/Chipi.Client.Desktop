/* eslint no-shadow: [2, { "allow": ["comments"] }] */

import { SET_STATUS_BAR_TEXT } from "@app/main/constants/actionTypes";
import { IStatusBarState, IStatusBarActionTypes } from "./types";

const initialState: IStatusBarState = {
  text: undefined
};

export function statusBarReducer(
  state = initialState,
  action: IStatusBarActionTypes
): IStatusBarState {
  switch (action.type) {
    case SET_STATUS_BAR_TEXT: {
      return {
        ...state,
        text: action.payload
      };
    }
    default:
      return state;
  }
}
