import React, { RefObject } from "react";
import PropTypes from "prop-types";
import styles from "./styles.css";
import Logger from "../../../lib/logger";

const logger = new Logger("component.Logo");

// Define the available states for the logo icon
const availableLogoStates: any = {
  "": {
    pixels: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  ":p": {
    pixels: [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0]
  },

  ":(": {
    pixels: [0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0]
  },

  ":D": {
    pixels: [0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0]
  },

  ":o": {
    pixels: [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0]
  },

  loading: {
    options: {
      iterations: Infinity,
      duration: 25 * 25
    },
    pixels: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
};

interface ILogoProps {
  isLoading: boolean;
}

interface ILogoState {
  logoState: string;
  previousLogoState: string;
}

class Logo extends React.PureComponent<ILogoProps, ILogoState> {
  private logoDrawRef: RefObject<any>;

  constructor(props: ILogoProps) {
    super(props);
    this.createChildren = this.createChildren.bind(this);
    this.drawLogo = this.drawLogo.bind(this);

    this.logoDrawRef = React.createRef();

    this.state = {
      logoState: this.props.isLoading ? "loading" : ":p",
      previousLogoState: ""
    };
  }

  componentDidMount() {
    this.drawLogo();
  }

  componentDidUpdate(prevProps: ILogoProps, prevState: ILogoState) {
    logger.verbose("Logo did update", { props: this.props, prevProps });

    const newState = {
      logoState: this.props.isLoading ? "loading" : ":p",
      previousLogoState: prevState.logoState
    };

    if (newState.logoState != prevState.logoState) {
      this.setState(newState);
      this.drawLogo();
    }
  }

  drawLogo() {
    const { logoState, previousLogoState } = this.state;

    const newDraw = availableLogoStates[logoState];
    const prevDrawPixels = availableLogoStates[previousLogoState].pixels;

    const pixelElements = this.logoDrawRef.current.children;

    newDraw.pixels.forEach((value: any, index: number) => {
      const pixelElement = pixelElements[index];

      pixelElement.animate(
        [
          {
            opacity: prevDrawPixels[index]
          },
          {
            opacity: 1,
            offset: 0.1
          },
          {
            opacity: value
          }
        ],
        Object.assign(
          {
            duration: 400,
            delay: index * 25,
            easing: "ease",
            fill: "both",
            iterations: 1
          },
          newDraw.options
        )
      );
    });
  }

  createChildren(size: number, step: number) {
    const children = [];

    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        children.push(
          <rect
            key={`${x}${y}`}
            width={step}
            height={step}
            x={x}
            y={y}
            fill="currentColor"
            opacity={0}
          />
        );
      }
    }
    return children;
  }

  render() {
    const size = 40;
    const step = size / 5;

    const svgProperties = {
      width: size,
      height: size,
      viewBox: `0 0 ${size} ${size}`
    };

    return (
      <div className={styles.logoWrapper}>
        <svg xmlns="http://www.w3.org/2000/svg" {...svgProperties} ref={this.logoDrawRef}>
          {this.createChildren(size, step)}
        </svg>
      </div>
    );
  }
}

export default Logo;
