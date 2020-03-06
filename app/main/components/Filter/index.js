import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import style from "./styles.css";

export default class Filter extends PureComponent {
  focus() {
    this.filter.focus();
  }

  render() {
    const { label, onClick } = this.props;
    return (
      <button
        title="Click to remove filter"
        onClick={onClick}
        ref={c => (this.filter = c)}
        className={style.filter}
        tabIndex={-1}
      >
        {label}
      </button>
    );
  }
}

Filter.propTypes = {
  label: PropTypes.string
};
