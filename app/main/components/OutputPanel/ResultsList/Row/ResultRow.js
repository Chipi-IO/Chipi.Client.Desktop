import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import GenericRow from "./GenericRow";

class ResultRow extends PureComponent {
  render() {
    const { props } = this;

    return <GenericRow {...props} />;
  }
}

ResultRow.propTypes = {
  title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  icon: PropTypes.string,
  selected: PropTypes.bool,
  subtitle: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  subtitleIcon: PropTypes.string,
  onMouseClick: PropTypes.func,
  onMouseOver: PropTypes.func,
  onDisplayActions: PropTypes.func,
  updated: PropTypes.bool
};

export default ResultRow;
