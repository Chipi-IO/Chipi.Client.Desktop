import {
  IS_OFFLINE,
  AUTH_STATE_CHANGED,
  TOKENS_CHANGED,
  START_AUTHENTICATING,
  ONLINE,
  OFFLINE
} from '../constants/actionTypes'

export function authStateChanged(authState) {
  return {
    type: AUTH_STATE_CHANGED,
    payload: {
      authState
    }
  }
}

export function tokensChanged(accessToken) {
  return {
    type: TOKENS_CHANGED,
    payload: accessToken
  }
}

export function startAuthenticating() {
  return {
    type: START_AUTHENTICATING
  }
}

export function online() {
  return {
    type: ONLINE
  }
}

export function offline() {
  return {
    type: OFFLINE
  }
}
