import React from "react";
import styles from "./styles.css";
import cn from "classnames";
import ReactTooltip from 'react-tooltip' 

import ReactAvatar, { getRandomColor } from "react-avatar";

const customColors = [
  "#5E005E",
  "#AB2F52",
  "#E55D4A",
  "#E88554",
  "#4194A6",
  "#82CCD9",
  "#FFCC6B",
  "#F2855C",
  "#7D323B"
];

export default function Avatar({ src, selected, title, size = 50, tooltip }) {
  return (
    <div className={cn(styles.avatar, selected && styles.avatarSelected)} title={tooltip} data-tip={tooltip}>
      {src ? (
        <ReactAvatar src={src} round={true} size={size} />
      ) : title ? (
        <ReactAvatar
          name={title}
          round={true}
          color={getRandomColor([title], customColors)}
          size={size}
          textSizeRatio={2}
        />
      ) : null}
      {tooltip && <ReactTooltip effect="solid" place="bottom" />}
    </div>
  );
}

/*
export default function Avatar({src, selected, title}) {
  return src ? (
    <img
      className={cn(styles.avatar, selected && styles.avatarSelected)}
      src={src}
      title={title}
      alt=""
      role="presentation"
    />
  ) : null;
}
*/
