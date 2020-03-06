import { Component } from "react";
import PropTypes from "prop-types";
import Preload from "../../Preload";
import getFileIcon from "./getFileIcon";
import Logger from "../../../../lib/logger";
import utils from "../../../../lib/utils";

const logger = new Logger("smartIcon.fileIcon");

class FileIcon extends Component {
  constructor(props) {
    super(props);
  }

  componentWillUpdate(prevProps) {
    logger.verbose("File icon will update", { props: this.props, prevProps });
  }

  shouldComponentUpdate(nextProps, nextState) {
    // If shallow equal, then we should not update the component
    return !utils.shallowEqual(this.props, nextProps);
  }

  render() {
    const { path, className, width, height } = this.props;

    return (
      <Preload promise={getFileIcon(path)} key={path}>
        {src => <img width={width} height={height} src={src} alt="" className={className} />}
      </Preload>
    );
  }
}

FileIcon.propTypes = {
  className: PropTypes.string,
  path: PropTypes.string.isRequired,
  width: PropTypes.string,
  height: PropTypes.string
};

export default FileIcon;
