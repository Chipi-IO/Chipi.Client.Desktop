import React from "react";
import PropTypes from "prop-types";
import WithFetchedFile from "./WithFetchedFile";
import ReactMarkdown from "react-markdown";
import styles from "./styles/index.css";

const Markdown = ({ path }) => (
  <WithFetchedFile path={path}>
    {source => <ReactMarkdown source={source} className={styles.previewText} />}
  </WithFetchedFile>
);

Markdown.propTypes = {
  path: PropTypes.string.isRequired
};

export default Markdown;
