import React from "react";
import PropTypes from "prop-types";
import FileDetails from "./FileDetails";
import styles from "./styles.css";
import { SmartIcon } from "cerebro-ui";

const Preview = ({ path, name, icon }) => (
  <div>
    {icon && (
      <div className={styles.previewIcon}>
      </div>
    )}
    <div className={styles.previewName}>{name}</div>
    <FileDetails path={path} key={path} skipName />
  </div>
);

Preview.propTypes = {
  path: PropTypes.string,
  name: PropTypes.string,
  icon: PropTypes.string
};

export default Preview;
