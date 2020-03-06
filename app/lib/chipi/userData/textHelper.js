import nlp from "compromise";
import Logger from "../../logger";

const logger = new Logger("lib.chipi.userData.textHelper");

/**
 * Get terms from provided text for indexing
 * @param {String} text
 */
const getTermsForIndexing = text => {
  const terms = normalize(text).split(' ');

  //let terms = nlpDoc.ngrams({ max_size: 2 }).out("array");

  return terms;
};

/**
 * Normalize the text
 * @param {*} text
 */
const normalize = text => {
  return nlp(text)
    .normalize()
    .out("text");
};

export default {
  getTermsForIndexing,
  normalize
};
