import chipiRequest from '../request'
import {CHIPI_APIS} from 'Environment'
import { app, remote } from 'electron'

export const sendFeedback = ({authToken, sentiment, message}) => {
  return chipiRequest.post({
    url: `${CHIPI_APIS.helpApiHost}/feedback.new`,
    data: {
      sentiment,
      message,
      appVersion: (app || remote.app).getVersion()
    }
  }, authToken)
}
