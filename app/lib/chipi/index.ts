import ChipiAuth from "./auth";
import ChipiSearch from "./search";
import ConnectorService from "./connector";
import ChipiIndexing from "./indexing";
import ChipiAnalytics from "./analytics";
import UserData from "./userData";
import ChipiMagicFilterHelper from "./magicFilterHelper";

export const chipiAuth = ChipiAuth.instance;
export const chipiSearch = ChipiSearch;
export const ChipiConnectorService = ConnectorService;
export const chipiIndexing = ChipiIndexing;
export const chipiAnalytics = ChipiAnalytics;
export const chipiUserData = UserData;
export const chipiMagicFilterHelper = ChipiMagicFilterHelper;
