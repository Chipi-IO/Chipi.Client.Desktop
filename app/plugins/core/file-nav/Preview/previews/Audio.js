import React from "react";
import styles from "./styles/index.css";
import PropTypes from "prop-types";

const Audio = ({ path }) => (
  <audio src={path} className={styles.previewAudio} controls="true" />
);

Audio.propTypes = {
  path: PropTypes.string.isRequired
};

export default Audio;
