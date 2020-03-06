import Logger from '../../../../lib/logger'

var logger = new Logger('ChipiPluginUtil');

export function shorten(str, maxLen, separator = ' ') {
  if (str.length <= maxLen) return str;
  let shortenString = str.substr(0, str.lastIndexOf(separator, maxLen));
  if (shortenString.length < str.length)
    shortenString = `${shortenString}…`

  return shortenString;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

export function formatTimestamp(ts) {
  let date = new Date(0);
  date.setUTCMilliseconds(parseInt(ts));

  return date;
}
