import React from "react";
import PropTypes from "prop-types";
import listArchive from "./listArchive";
import FileDetails from "../../FileDetails";
import styles from "../styles/index.css";

const Archive = ({ path }) => {
  const renderer = (list, error) => {
    if (error) return <div>Error fetching archive</div>;
    return (
      <div className={styles.previewArchive}>
        <div className={styles.filesListText}>Files:</div>
        <ul key={path}>
          {list.map(file => (
            <li>{file}</li>
          ))}
        </ul>
        <FileDetails path={path} />
      </div>
    );
  };
  // TODO: Fix the promise loading component
  return (
    <div>Loading...</div>
    /*<Preload promise={listArchive(path)} loader={<div>Loading...</div>}>
      {renderer}
    </Preload>*/
  );
};

Archive.propTypes = {
  path: PropTypes.string.isRequired
};

export default Archive;
