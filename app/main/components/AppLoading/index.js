import React, { PureComponent } from 'react';
import styles from './styles.css'
const chipiStartLogUrl = '../resources/chipi.png';

export default class AppLoading extends PureComponent {
  render() {
    return (
      <div className={styles.appLoading}>
        <img src={chipiStartLogUrl} />
      </div>
    )
  }
}
