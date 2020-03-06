import React from "react";
import TimeAgo from "react-timeago";
import styles from "./styles.css";
import dateFormat from 'dateformat'

export default function DetailsTimestamp({ timestamp }) {
  if (!timestamp) return <div />;

  const dateTime = new Date(timestamp);

  const timeDiff = Math.abs(Date.now() - dateTime.getTime());
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return (
    <div className={styles.timestamp}>
      Updated&nbsp;
      {diffDays < 10 ? <TimeAgo date={dateTime} /> : dateFormat(dateTime, "dd-mmm-yyyy HH:MM:ss")}
    </div>
  );
}
