import { connectRouter } from "connected-react-router";
import { authStateReducer } from "./authState/reducers";
import { magicFilterReducer } from "./magicFilter/reducers";
import { outputReducer } from "./output/reducers";
import { outputDetailsViewReducer } from "./outputDetailsView/reducers";
import { searchReducer } from "./search/reducers";
import { statusBarReducer } from "./statusBar/reducers";
import { combineReducers } from "redux";
import { History } from "history";
import { fullThreadReducer } from "./fullThread/reducers";
import { connectReducer } from "./connect/reducers";

export const createRootReducer = (history: History<any>) =>
  combineReducers({
    authState: authStateReducer,
    magicFilter: magicFilterReducer,
    output: outputReducer,
    outputDetailsView: outputDetailsViewReducer,
    search: searchReducer,
    statusBar: statusBarReducer,
    fullThread: fullThreadReducer,
    connect: connectReducer,
    router: connectRouter(history)
  });
