import { createGlobalStyle, keyframes } from "styled-components";
import { ITransition } from "./index";

class SlideTransition implements ITransition {
  public transitionClassName = "slid";
  public duration = 1000;

  constructor() {
    const slideOut = keyframes`
    0% { }
    25% { opacity: .5; transform: translateZ(-500px); }
    75% { opacity: .5; transform: translateZ(-500px) translateX(-200%); }
    100% { opacity: .5; transform: translateZ(-500px) translateX(-200%); }
    `;
        const slideIn = keyframes`
    0%, 25% { opacity: .5; transform: translateZ(-500px) translateX(200%); }
    75% { opacity: .5; transform: translateZ(-500px); }
    100% { opacity: 1; transform: translateZ(0) translateX(0); }
    `;
        createGlobalStyle`
    .${this.transitionClassName}-exit {
      animation: ${slideOut} ${this.duration}ms both ease;
    }
    .${this.transitionClassName}-enter {
      animation: ${slideIn} ${this.duration}ms both ease;
    }
    `;
  }
}

export default new SlideTransition();
