import Logger from '../../../lib/logger'
import { send } from '../../../lib/rpc'
import { isDev } from 'Environment'

var logger = new Logger('plugins.dev-manual-signin');

// Settings plugin name
const NAME = 'Dev Manual Signin';
const signinPrefix = ':signin';

const order = -2

/**
 * Plugin to exit from Chipi
 *
 * @param  {String} options.term
 * @param  {Function} options.display
 */
const fn = ({ term, display, actions }) => {
    if (term.startsWith(signinPrefix) && term.length > 0) {
        const authCode = term.replace(signinPrefix, '').trim();
        if (authCode && authCode.length > 0) {
            display([
                {
                    id: `dev-manual-signin-${authCode}`,
                    title: `Dev Signin with ${authCode}`,
                    onSelect: (event) => {
                        event.preventDefault();
                        send('authCodeReceived', authCode);
                    }
                }
            ])
        }
    }
}

export default {
    fn,
    supportEmptyTerm: false,
    supportFilters: false,
    name: NAME
}
