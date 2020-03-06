import Logger from "../../lib/logger";

import { HIGHLIGHT_OUTPUT_ITEM, HIDE_DETAILS_VIEW } from "../constants/actionTypes";

const logger = new Logger("actions.output");

/**
 * Action that selecting the output item
 *
 * @param {Object} highlightedOutputIndex  the output item id is being selected
 */
export function highlightOutputItem(highlightedOutputIndex) {
  //logger.verbose('Select output item called', { highlightedOutputItem })
  return {
    type: HIGHLIGHT_OUTPUT_ITEM,
    payload: { highlightedOutputIndex }
  };
}

export function hideDetailsView() {
  return {
    type: HIDE_DETAILS_VIEW,
    payload: {}
  };
}
