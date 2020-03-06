import React from "react";

import DetailsAvatar from "../DetailsView/DetailsAvatar";
import DetailsTimestamp from "../DetailsView/DetailsTimestamp";
import styles from "./styles.css";

interface IPreviewHeaderProps {
  detailsItem: any;
}

interface IPreviewHeaderState {}

class PreviewHeader extends React.Component<IPreviewHeaderProps, IPreviewHeaderState> {
  constructor(props: IPreviewHeaderProps) {
    super(props);
  }

  render() {
    const { detailsItem } = this.props;

    if (!detailsItem) {
      return;
    }

    if (!detailsItem.chipi) return <div className={styles.previewHeader}>{detailsItem.title}</div>;

    return (
      <div className={styles.previewHeader}>
        {detailsItem.sentByPerson && (
          <div className={styles.previewSenderAvatar}>
            <DetailsAvatar
              src={detailsItem.sentByPerson.image}
              title={detailsItem.sentByPerson.title}
              size={40}
            />
          </div>
        )}
        <div className={styles.previewSenderTitle}>
          <div className={styles.previewSenderName}>
            {detailsItem.sentByPerson && detailsItem.sentByPerson.title}
          </div>
          {detailsItem.timestamp && (
            <div className={styles.previewSentTime}>
              <DetailsTimestamp timestamp={detailsItem.timestamp} />
            </div>
          )}
        </div>
      </div>
    );
  }

  //function PreviewHeader(props) {
}

export default PreviewHeader;
