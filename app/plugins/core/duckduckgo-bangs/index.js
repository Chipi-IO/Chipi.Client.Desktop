import { shell } from 'electron'
import axios from 'axios'
import debounce from 'lodash/debounce'
import Logger from '../../../lib/logger'
import duckLogo from './duck-logo.png'

var logger = new Logger('DuckDuckGoBangs Plugin');

// Settings plugin name
const NAME = 'DuckDuckGo Bangs!'

const order = -2

/**
 * Plugin to exit from Chipi
 *
 * @param  {String} options.term
 * @param  {Function} options.display
 */
const fn = ({ term, display, displaySuggestion, actions }) => {
    if (term.startsWith("!") && term.length > 0) {
        return getBangDisplay(term, actions)
            .then(results => {
                if (results)
                    display(results);
            });
    }
}

const getBangPrefixSuggestions = (bangPrefix) => {
    return axios.get(`https://api.duckduckgo.com/ac/?q=${bangPrefix}&format=json&pretty=0&no_redirect=1`)
        .then(response => {
            return response.data;
        })
}

const getBangSearchSuggestion = (bangPrefix, searchTextTerm) => {
    return axios.get(`https://api.duckduckgo.com/?q=${bangPrefix}+${searchTextTerm}&format=json&pretty=0&no_redirect=1`)
        .then(response => {
            return response.data;
        })
}

const getBangDisplay = (term, actions) => {
    const originalBangPrefix = term.split(' ')[0];
    const originalSearchTerm = term.replace(originalBangPrefix, '').trim();
    const searchTextTerm = originalSearchTerm.replace(/\s/g, '+');

    return getBangPrefixSuggestions(originalBangPrefix)
        .then(bangPrefixSuggestions => {
            if (!bangPrefixSuggestions || bangPrefixSuggestions.length === 0)
                return;
            logger.verbose('Bang prefix suggestions returned', { bangPrefixSuggestions });

            if (searchTextTerm && searchTextTerm.length > 0) {
                return buildSearchResults(bangPrefixSuggestions, searchTextTerm, originalSearchTerm, actions);
            }

            return buildBangsPrefixSuggestionResults(originalBangPrefix, bangPrefixSuggestions, actions);
        })
}

/**
 * 
 * @param {*} bangsSuggestions 
 */
const buildBangsPrefixSuggestionResults = (originalBangPrefix, bangPrefixSuggestions, actions) => {
    let bangPrefixes = bangPrefixSuggestions.slice(0, 10);

    if (originalBangPrefix.length >= 3) {
        bangPrefixes = bangPrefixes.slice(0, 4);
    }

    return bangPrefixes.map(bangPrefix => {
        return {
            id: `duckduckgo-${bangPrefix.phrase}`,
            title: `${bangPrefix.phrase}`,
            icon: bangPrefix.image,
            avatars: [{
                src: duckLogo,
                title: "DuckDuckGo"
            }],
            onSelect: (event) => {
                event.preventDefault();
                actions.replaceTerm(bangPrefix.phrase);
            },
            sentByPerson: {
                image: duckLogo,
                title: "DuckDuckGo"
            }
        }
    })
}

/**
 * 
 * @param {*} bangsSuggestions 
 * @param {*} searchTextTerm 
 */
const buildSearchResults = (bangPrefixSuggestions, searchTextTerm, originalSearchTerm, actions) => {
    // select the first 4 bang prefix suggestions
    const bangPrefixes = bangPrefixSuggestions.slice(0, 4);

    var bangSearchSuggestionPromises = bangPrefixes.map(bangPrefix => {
        return getBangSearchSuggestion(bangPrefix.phrase, searchTextTerm)
            .then(bangSearchSuggestion => {
                return {
                    bangPrefix,
                    bangSearchSuggestion
                }
            })
    })

    return Promise.all(bangSearchSuggestionPromises)
        .then((bangSearchResults) => {
            if (!bangSearchResults || bangSearchResults.length === 0)
                return;

            return bangSearchResults.map(bangSearchResult => {
                if (bangSearchResult.bangSearchSuggestion && bangSearchResult.bangSearchSuggestion.Redirect) {
                    return {
                        id: `duckduckgo-${bangSearchResult.bangPrefix.phrase}-${searchTextTerm}`,
                        title: `${bangSearchResult.bangPrefix.phrase} ${originalSearchTerm}`,
                        subtitle: `${bangSearchResult.bangSearchSuggestion.Redirect}`,
                        icon: bangSearchResult.bangPrefix.image,
                        avatars: [{
                            src: duckLogo,
                            title: "DuckDuckGo"
                        }],
                        onSelect: () => {
                            actions.open(bangSearchResult.bangSearchSuggestion.Redirect);
                            return;
                        },
                        order
                    }
                }
            }).filter(Boolean);
        })
}


export default {
    fn,
    supportEmptyTerm: false,
    supportFilters: false,
    name: NAME
}
