import shortname_to_emoji from "./shortname-to-emoji.json";
import Logger from "../../../../../../lib/logger";

const logger = new Logger("plugins.core.rendering.engines.emoji");

const skintoneRegex = /\:[\w\d\+\-\_]+\:\:skin-tone-\d\:/gi;
const shortnameRegex = /\:[\w\d\+\-\_]+\:/gi;

const shortnameToEmoji = (str = "") => {
  logger.verbose("Emoji parser called", { str });

  return (
    str
      // 1. Replace skin-tone emoji, e.g. ':blond-haired-woman::skin-tone-6:'
      .replace(skintoneRegex, sn => shortname_to_emoji[sn])
      // 2. Replace remaining emoji, e.g. ':sunglasses:', ':star:'
      .replace(shortnameRegex, sn => shortname_to_emoji[sn])
  );
};

export default {
  shortnameToEmoji: shortnameToEmoji
};
