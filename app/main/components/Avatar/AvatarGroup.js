import React from "react";
import styles from "./styles.css";
import Avatar from "./Avatar";
import cn from "classnames";

export default function AvatarGroup({ avatars, selected, className, size = 40, limit = 5 }) {
  const counter =
    avatars.length > limit ? (
      <span key="avatarcounter" className={cn(styles.avatar, styles.avatarCounter)}>
        +{avatars.length - limit}
      </span>
    ) : null;

  const avatarCount = Math.min(avatars.length, limit);

  const els = [];
  for (let i = 0; i < avatarCount; i++) {
    if (avatars[i]) {
      els.push(<Avatar key={i} selected={selected} {...avatars[i]} size={size} />);
    } else {
      break;
    }
  }

  if (counter) {
    els.push(counter);
  }

  return <div className={cn(className, styles.avatarGroup)}>{els}</div>;
}
