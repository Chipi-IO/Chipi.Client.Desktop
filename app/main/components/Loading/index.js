import React, { PureComponent } from 'react';
import styles from './styles.css'

export default class Loading extends PureComponent {
  render() {
    return (
      <div className={styles.loading}>
        <div className={`${styles.loadingDot} ${styles.loadingDelay1}`}/>
        <div className={`${styles.loadingDot} ${styles.loadingDelay2}`}/>
        <div className={`${styles.loadingDot} ${styles.loadingDelay3}`}/>
      </div>
    )
  }
}
