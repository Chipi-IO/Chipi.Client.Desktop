import { CHIPI_APIS } from 'Environment'
import chipiRequest from '../request'

import Logger from '../../logger'
import { error } from 'util';

let logger = new Logger('lib.chipi.indexing')

export const indexingApplication = (connectId, authToken) => {
    var indexingApplicationRequestOptions = {
        url: `${CHIPI_APIS.indexingApiHost}/indexing.application`,
        data: {
            connectId
        }
    };

    logger.debug('[indexingApplication] Indexing application options', indexingApplicationRequestOptions)

    return chipiRequest.post(indexingApplicationRequestOptions, authToken)
        .then(response => {
            // logger.debug('Fetch available application list response', response);

            if (response.ok)
                return response.payload;

            logger.error('Indexing application response was not ok', response);

            throw new Error(`Indexing application failed, ${response.error_code}`);
        })
        .catch(err => {
            logger.error('Failed to indexing application ', { err });

            throw err;
        })
}

export default {
    indexingApplication
}
