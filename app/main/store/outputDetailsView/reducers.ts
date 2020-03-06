import Logger from "@app/lib/logger";
import jsonQuery from "json-query";
import { chipiAnalytics } from "@app/lib/chipi";

import {
  OPEN_DETAILS_VIEW,
  HIDE_DETAILS_VIEW,
  UPDATE_TERM,
  RESET,
  HIGHLIGHT_OUTPUT_ITEM
} from "@app/main/constants/actionTypes";
import { IOutputDetailsViewState, IOuputDetailsViewActionTypes } from "./types";

const logger = new Logger("reducer.outputDetailsView");

const initialState: IOutputDetailsViewState = {
  showingDetailsView: false,
  detailsViewActions: [],
  detailsItem: null
};

export function outputDetailsViewReducer(
  state = JSON.parse(JSON.stringify(initialState)),
  action: IOuputDetailsViewActionTypes
) {
  switch (action.type) {
    case UPDATE_TERM:
    case HIGHLIGHT_OUTPUT_ITEM:
    case RESET: {
      return JSON.parse(JSON.stringify(initialState));
    }
    case OPEN_DETAILS_VIEW: {
      const { triggeredByActionName, detailsItem } = action.payload;

      if (!detailsItem) {
        logger.error("Details item is empty");
        return JSON.parse(JSON.stringify(initialState));
      }

      let previewActions: any[] = [];

      const returnState = {
        ...state,
        showingDetailsView: true,
        detailsViewActions: previewActions,
        detailsItem
      };

      if (!detailsItem.actions) {
        return returnState;
      }

      const triggeredByAction = jsonQuery(`[name=${triggeredByActionName}]`, {
        data: detailsItem.actions
      }).value;

      logger.verbose("Found triggered by action", {
        triggeredByActionName,
        actions: detailsItem.actions,
        triggeredByAction
      });

      if (!triggeredByAction || !triggeredByAction.allowedActions) {
        return returnState;
      }

      triggeredByAction.allowedActions.forEach((allowedActionName: any) => {
        const allowedAction = jsonQuery(`[name=${allowedActionName}]`, {
          data: detailsItem.actions
        }).value;

        logger.verbose("Found allowed action within details view", { allowedAction });

        if (allowedAction) {
          previewActions.push(allowedAction);
        }
      });

      returnState.detailsViewActions = previewActions;

      logger.verbose("Stat after OPEN_DETAILS_VIEW", { returnState });
      return returnState;
    }
    case HIDE_DETAILS_VIEW: {
      chipiAnalytics.addNewEvent(
        `search.result.action`,
        state.detailsItem && {
          id: state.detailsItem.id,
          title: state.detailsItem.title,
          plugin: state.detailsItem.plugin,
          displayPosition: state.detailsItem.displayPosition,
          searchedTerm: state.detailsItem.searchedTerm
        },
        { name: "Back" }
      );

      return {
        ...state,
        showingDetailsView: false
      };
    }
    default:
      return state;
  }
}
