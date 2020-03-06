import React, { Component, RefObject } from "react";
import PropTypes from "prop-types";
import styles from "./styles.css";
import { connect } from "react-redux";
import Logger from "../../../../lib/logger";
import { MAX_OUTPUT_HEIGHT, CONTENT_VISIBLE_WIDTH } from "../../../constants/ui";
import cn from "classnames";

const logger = new Logger("components.OutputPanel.SlidingCard");

interface ISlidingCardProps {
  isVisible: boolean;
  layer: number;
  atTheFront: boolean;
  clickWhenAtBack: Function;
}

interface ISlidingCardState {
  animation: "showingSlidingCard" | "hidingSlidingCard" | "";
  zIndex: number;
  width: number;
  currentState: "slidingCardShown" | "slidingCardHidden";
}

class SlidingCard extends React.Component<ISlidingCardProps, ISlidingCardState> {
  private slidingContainerRef: React.RefObject<HTMLDivElement>;
  private transitionEndEventName = "webkitTransitionEnd";

  constructor(props: ISlidingCardProps) {
    super(props);

    this.state = {
      zIndex: this.props.layer * 5 + 10,
      animation: "",
      width: this.props.layer === 0 ? CONTENT_VISIBLE_WIDTH : 600,
      currentState: this.props.isVisible ? "slidingCardShown" : "slidingCardHidden"
    };

    this.onClickWhenAtBack = this.onClickWhenAtBack.bind(this);
    this.transitionEnd = this.transitionEnd.bind(this);

    this.slidingContainerRef = React.createRef();
  }

  componentDidMount() {
    // Attach animation end listener
    //item.addEventListener(transitionEvent, transitionEndCallback);
    if (this.slidingContainerRef.current) {
      this.slidingContainerRef.current.addEventListener(
        this.transitionEndEventName,
        this.transitionEnd
      );
    }
  }

  transitionEnd(event: any) {
    const { animation } = this.state;

    switch (animation) {
      case "showingSlidingCard":
        this.setState({
          currentState: "slidingCardShown",
          animation: ""
        });
        break;
      case "hidingSlidingCard":
        this.setState({
          currentState: "slidingCardHidden",
          animation: ""
        });
        break;
      default:
        return;
    }
  }

  componentDidUpdate(prevProps: ISlidingCardProps) {
    if (prevProps.isVisible !== this.props.isVisible) {
      this.setState({
        animation: this.props.isVisible ? "showingSlidingCard" : "hidingSlidingCard"
      });
    }
  }

  onClickWhenAtBack(event: any) {
    const { atTheFront, clickWhenAtBack } = this.props;

    if (atTheFront) {
      return;
    }

    if (clickWhenAtBack) {
      clickWhenAtBack();
    }
  }

  render() {
    const { layer, atTheFront, isVisible } = this.props;
    const { animation, zIndex, width, currentState } = this.state;
    return (
      <div
        style={{ width: width, height: MAX_OUTPUT_HEIGHT, zIndex: zIndex }}
        className={cn(
          styles.slidingCard,
          styles[`slidingCardLayer-${layer}`],
          styles[animation],
          currentState === "slidingCardShown" && styles.slidingCardLayerShown
        )}
        ref={this.slidingContainerRef}
      >
        {this.props.children}
        <div
          style={{ zIndex: zIndex + 1 }}
          className={cn(
            styles.floatingCover,
            isVisible && !atTheFront && styles.floatingCoverToVisible,
            isVisible && atTheFront && styles.floatingCoverToInvisible
          )}
          onClick={this.onClickWhenAtBack}
        />
      </div>
    );
  }
}

/*function mapStateToProps(state) {
  return {};
}*/

export default connect(
  null,
  {}
)(SlidingCard);
