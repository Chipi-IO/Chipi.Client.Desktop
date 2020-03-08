import { push } from "connected-react-router";
import { ITransition } from "../routes/transitions";
import flip from "@app/main/routes/transitions/flip"

/**
 * Go to route path
 * @param {*} routePath
 */
export const goToRoute = (routePath, transition: ITransition) => {
  return push(routePath, { transition });
};

export const goToSettings = () => {
  return push("/settings", { transition: flip });
};

export const backToMainFromSettings = () => {
  return push("/", { transition: flip });
};
