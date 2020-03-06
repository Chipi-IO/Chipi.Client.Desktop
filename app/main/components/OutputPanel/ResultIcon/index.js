import React, { Component } from "react";
import PropTypes from "prop-types";
import SmartIcon from "../../SmartIcon";
import styles from "./styles.css";
import Logger from "../../../../lib/logger";
import cn from "classnames";

const logger = new Logger("output.resutlIcon");

class ResultIcon extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { className, icon, size } = this.props;

    const iconSizes = new Map([
      ["xsmall", "18px"],
      ["small", "24px"],
      ["medium", "30px"],
      ["large", "40px"]
    ])

    return (
      <div className={cn(className, styles[size])}>
        {icon && <SmartIcon width={iconSizes.get(size)} height={iconSizes.get(size)} path={icon} className={cn(styles.icon, styles[size])} />}
      </div>
    );
  }
}

ResultIcon.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string
};

export default ResultIcon;
