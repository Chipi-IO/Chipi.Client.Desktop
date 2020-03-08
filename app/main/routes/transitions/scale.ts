import { createGlobalStyle, keyframes } from 'styled-components'
import { ITransition } from "./index";

class ScaleTransition implements ITransition {
  public transitionClassName = "scale";
  public duration = 600;

  constructor() {
    const moveFromRight = keyframes`
    from { transform: translateX(100%); }
    `
    const scaleDown = keyframes`
    to { opacity: 0; transform: scale(.8); }
    `
    
    createGlobalStyle`
    .${this.transitionClassName}-enter, .${this.transitionClassName}-exit {
      position: relative;
    }
    .${this.transitionClassName}-enter-active {
      animation: ${moveFromRight} ${this.duration}ms ease both;
      z-index: 2;
    }
    .${this.transitionClassName}-exit-active {
      animation: ${scaleDown} ${this.duration}ms ease both;
      z-index: 1;
    }
    `;
  }
}

export default new ScaleTransition()