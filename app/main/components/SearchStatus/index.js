import React, { Component } from "react";
import PropTypes from "prop-types";
import styles from "./styles.css";
import Loading from "../Loading";
import commonStyles from "../Common/styles.css";
import Logger from "../../../lib/logger";

const logger = new Logger("component.searchStatus");

class SearchStatus extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { isOffline, isLoading, authState, login, term } = this.props;
    return (
      <div className={styles.status}>
        {isOffline ? (
          <div className={styles.offline}>
            <span className={styles.emoji}>🙅</span> Offline
          </div>
        ) : authState.isAuthenticating ? (
          <div></div>
        ) : authState.isAuthenticated && (
            <div className={commonStyles.draggable}>authState.user</div>
          ) ? (
          authState.user.picture ? (
            <img src={authState.user.picture} className={styles.userPicture} />
          ) : (
            authState.user.name
          )
        ) : (
          <button
            ref={c => (this.button = c)}
            type="button"
            className={styles.signInButton}
            onClick={login}
          >
            Sign in
          </button>
        )}
      </div>
    );
  }
}

SearchStatus.propTypes = {
  isLoading: PropTypes.bool,
  term: PropTypes.string,
  authState: PropTypes.object,
  login: PropTypes.func,
  shouldFocusSignIn: PropTypes.bool
};

export default SearchStatus;
