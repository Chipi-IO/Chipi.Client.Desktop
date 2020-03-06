import React, { Component } from "react";
import PropTypes from "prop-types";
import FileIcon from "./fileIcon";
import FontAwesome from "react-fontawesome";
import Logger from "../../../lib/logger";

const logger = new Logger("components.smartIcon");

/**
 * Check if provided string is an image src
 * It can be a path to png/jpg/svg image or data-uri
 *
 * @param  {String} path
 * @return {Boolean}
 */
const isImage = path => /(^data:)|(\.(png|jpe?g|svg|ico)$)|(^https?:)/.test(path);

/**
 * Check if provided string matches a FontAwesome icon
 */
const isFontAwesome = path => /^fa-(.+)$/.test(path);

class SmartIcon extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { path, className, width, height } = this.props;
    const isFontAwesomePath = isFontAwesome(path);
    const isImagePath = isImage(path);

    if (isFontAwesomePath) {
      return <FontAwesome name={fontAwesomeMatches[1]} size="2x" className={className} />;
    }

    if (isImagePath) {
      return <img width={width} height={height} src={path} alt={path} className={className} />;
    }

    return <FileIcon width={width} height={height} path={path} className={className} />;
  }
}

SmartIcon.propTypes = {
  path: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string
};

export default SmartIcon;
