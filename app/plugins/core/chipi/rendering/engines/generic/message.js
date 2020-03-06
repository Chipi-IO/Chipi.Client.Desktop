import { icons } from '../../../images'
import S from 'string'
import Logger from '../../../../../../lib/logger'
import { shorten } from "../../util";

const logger = new Logger('ChipiSearchResultMessage')

S.extendPrototype();

function toSearchResultFormat({ foundItem }) {
  //logger.debug('Start converting Chipi message object to display result');

  return Promise.resolve({
    id: foundItem._id,
    icon: icons[foundItem._source.fromChannel],
    title: getTitle(foundItem._source).escapeHTML().s,
    onAction: (action) => {
      switch (action) {
        case 'open':
          return;
          return;
        default:
          return;
      }
    },
    onSelect: () => {
      return;
    }
  })
}


function getTitle(foundItem) {
  let title = shorten(foundItem.subject ? foundItem.subject : foundItem.text, 400);
  return title;
}

export default {
  toSearchResultFormat
}
