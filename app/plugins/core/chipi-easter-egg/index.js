import Logger from "../../../lib/logger";
import { send } from "../../../lib/rpc";
import Preview from "./preview";
import tetrisLogo from "./tetris.png";

var logger = new Logger("plugins.chipi-easter-egg");

// Settings plugin name
const NAME = "CHIPI Easter Eggs";
const matchingTerm = ":p :D";

const order = -2;

/**
 * Plugin for CHIPI eater eggs
 *
 * @param  {String} options.term
 * @param  {Function} options.display
 */
const fn = ({ term, display, actions }) => {
  if (term == matchingTerm) {
    const easterEggIterms = [];

    const tetrisEgg = _tetrisEgg(actions);

    display([tetrisEgg]);
  }
};

const _tetrisEgg = actions => {
  const resultItem = {
    id: "tetris",
    chipi: {
      channel: {
        icon: tetrisLogo,
        primaryName: "Tetris"
      }
    },
    icon: tetrisLogo,
    title: "Tetris",
    order,
    getPreview: () => {
      return <Preview egg="tetris" />;
    }
  };

  const resultActions = [
    {
      name: "Details",
      keys: "right",
      fn: event => {
        actions.openDetailsView("Details", resultItem);
        event.preventDefault();
      }
    }
  ];

  resultItem.actions = resultActions;
  return resultItem;
};

export default {
  fn,
  supportEmptyTerm: false,
  supportFilters: false,
  name: NAME
};
