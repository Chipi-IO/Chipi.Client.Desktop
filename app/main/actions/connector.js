import {
    FETCHING_AVAILABLE_APPS_LIST,
    FETCHING_AVAILABLE_APPS_LIST_SUCCESS,
    FETCHING_AVAILABLE_APPS_LIST_ERROR,

    FETCHING_CONNECTS_LIST,
    FETCHING_CONNECTS_LIST_SUCCESS,
    FETCHING_CONNECTS_LIST_ERROR,

    CONNECT_APP_AUTH_CODE_RECEIVED,
    CONNECT_APP_SUCCESS,
    CONNECT_APP_ERROR
} from '../constants/actionTypes'

import Logger from '../../lib/logger'

const logger = new Logger('actions.connector');

export function fetchingAvailableAppsList() {
    return {
        type: FETCHING_AVAILABLE_APPS_LIST
    }
}

export function fetchingAvailableAppsListSuccess(availableAppsList) {
    logger.debug('[fetchingAvailableAppsListSuccess] Called')
    return {
        type: FETCHING_AVAILABLE_APPS_LIST_SUCCESS,
        payload: availableAppsList
    }
}

export function fetchingAvailableAppsListError(error) {
    return {
        type: FETCHING_AVAILABLE_APPS_LIST_ERROR,
        payload: error
    }
}

export function fetchingConnectsList() {
    return {
        type: FETCHING_CONNECTS_LIST
    }
}

export function fetchingConnectsListSuccess(connectsList) {
    return {
        type: FETCHING_CONNECTS_LIST_SUCCESS,
        payload: connectsList
    }
}

export function fetchingConnectsListError(error) {
    return {
        type: FETCHING_CONNECTS_LIST_ERROR,
        payload: error
    }
}

//payload: { authCode, applicationId }
export function connectAppAuthCodeReceived(payload) {
    return {
        type: CONNECT_APP_AUTH_CODE_RECEIVED,
        payload
    }
}

export function connectAppError(error) {
    return {
        type: CONNECT_APP_ERROR,
        payload: error
    }
}

// payload: {connectId, authToken: this.props.authState.idToken}
export function connectAppSuccess(payload) {
    return {
        type: CONNECT_APP_SUCCESS,
        payload
    }
}
