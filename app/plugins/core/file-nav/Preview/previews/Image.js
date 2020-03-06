import React from "react";
import PropTypes from "prop-types";
import FileDetails from "../FileDetails";
import styles from "./styles/index.css";

const Image = ({ path }) => (
  <div className={styles.previewImage}>
    <img src={path} alt={path} />
    <FileDetails path={path} />
  </div>
);

Image.propTypes = {
  path: PropTypes.string.isRequired
};

export default Image;
