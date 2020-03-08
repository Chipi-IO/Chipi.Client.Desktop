import { History, createMemoryHistory } from "history";
import { createStore, applyMiddleware, compose } from "redux";
import thunkMiddleware from "redux-thunk";
import { routerMiddleware } from "connected-react-router";
import { createRootReducer } from "./rootReducers";


export const history: History<any> = createMemoryHistory({});

const rootReducer = createRootReducer(history);

export type AppState = ReturnType<typeof rootReducer>;

//const enhancer = applyMiddleware(thunk);

function configureStore(preloadedState?: any) {
  const composeEnhancer: typeof compose =
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const middlewares = [routerMiddleware(history), thunkMiddleware];
  const middleWareEnhancer = applyMiddleware(...middlewares);

  const store = createStore(rootReducer, preloadedState, composeEnhancer(middleWareEnhancer));
  return store;
}

const store = configureStore();

// Hot reloading
if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  module.hot.accept("./rootReducers", () => {
    store.replaceReducer(rootReducer);
  });
}

export default store;
