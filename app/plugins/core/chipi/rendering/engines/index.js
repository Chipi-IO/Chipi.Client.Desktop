import Logger from "../../../../../lib/logger";
import genericEngine from "./generic";
import slackEngine from "./slack";
import gmailEngine from "./gmail";
import gdriveEngine from "./gdrive";
import trelloEngine from "./trello";
import outlookEngine from "./outlook";
import chipiEngine from "./chipi";

var logger = new Logger("plugins.core.chipi.engines");

export default {
  gmail: gmailEngine,
  slack: slackEngine,
  gdrive: gdriveEngine,
  trello: trelloEngine,
  outlook: outlookEngine,
  chipi: chipiEngine
};
