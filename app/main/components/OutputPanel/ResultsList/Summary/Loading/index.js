import { PureComponent } from "react";
import styles from "./styles.css";
import Logger from "@app/lib/logger";

const logger = new Logger("component.OutputPanel.ResultsList.Summary.Loading");

// Define the available states for the logo icon
const availableloadingStates = {
  loading: {
    options: {
      iterations: Infinity,
      duration: 25 * 25
    },
    pixels: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
};

class Loading extends PureComponent {
  constructor(props) {
    super(props);
    this.createChildren = this.createChildren.bind(this);
    this.drawLoading = this.drawLoading.bind(this);

    this.loadingDrawRef = React.createRef();
  }

  componentDidMount() {
    this.drawLoading();
  }

  componentDidUpdate(prevProps) {
    logger.verbose("Logo did update", { props: this.props, prevProps });
    this.drawLoading();
  }

  drawLoading() {
    const newDraw = availableloadingStates["loading"];
    const prevDrawPixels = availableloadingStates["loading"].pixels;

    const pixelElements = this.loadingDrawRef.current.children;
    newDraw.pixels.forEach((value, index) => {
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

  createChildren(size, step) {
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
    const size = 20;
    const step = size / 5;

    const svgProperties = {
      width: size,
      height: size,
      viewBox: `0 0 ${size} ${size}`
    };

    return (
      <div className={styles.loadingWrapper}>
        <svg xmlns="http://www.w3.org/2000/svg" {...svgProperties} ref={this.loadingDrawRef}>
          {this.createChildren(size, step)}
        </svg>
      </div>
    );
  }
}

export default Loading;
