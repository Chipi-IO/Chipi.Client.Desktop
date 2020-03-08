import { createGlobalStyle, keyframes } from 'styled-components'
import { ITransition } from "./index";

class FadeTransition implements ITransition {
  public transitionClassName = "fade";
  public duration = 250;
}

export default new FadeTransition();