import { push } from "connected-react-router";

/**
 * Go to route path
 * @param {*} routePath 
 */
export const goToRoute = routePath => {
    return push(routePath);
  };
  