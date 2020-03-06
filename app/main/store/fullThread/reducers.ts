import Logger from "@app/lib/logger";
import { FullThreadActionTypes, IFullThreadState } from "./types";

import { OPEN_FULL_THREAD } from "@app/main/constants/actionTypes";

const initialState: IFullThreadState = {
    resultItem: undefined
};

export function fullThreadReducer(
  state = JSON.parse(JSON.stringify(initialState)),
  action: FullThreadActionTypes
): IFullThreadState {
  switch (action.type) {
    case OPEN_FULL_THREAD:
      return {
        ...state,
        resultItem: action.payload.resultItem
      };
    default:
      return state;
  }
}
