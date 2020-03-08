import { createGlobalStyle, keyframes } from 'styled-components'
import { ITransition } from "./index";
import "./flip.scss";

class FlipTransition implements ITransition {
  public transitionClassName = "flip";
  public duration = 600;

  constructor() {
    /*const rotateOut = keyframes`
      from {transform:rotate(0deg);}
      to {transform:rotate(-180deg);}
      `
      const rotateIn = keyframes`
      from {transform:rotate(180deg);}
      to {transform:rotate(0deg);}
      `

      createGlobalStyle`
      .${this.transitionClassName}-exit, ${this.transitionClassName}-exit-active {
        animation: ${rotateOut} ${this.duration}ms both ease;
      }
      .${this.transitionClassName}-enter, .${this.transitionClassName}-enter-active {
        animation: ${rotateIn} ${this.duration}ms both ease;
      }
      `;*/
    }
}

export default new FlipTransition();

