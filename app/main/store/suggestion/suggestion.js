import Logger from '@app/lib/logger'

import {
    UPDATE_TERM,
    SHOW_SUGGESTION,
    HIDE_SUGGESTION,
    HOVER_SUGGESTION,
    MOUSE_OUT_SUGGESTION
} from '../constants/actionTypes'

import { MAX_VISIBLE_RESULTS } from '../constants/ui'
const logger = new Logger('reducers.suggestion')

const initialState = {
    hoveredSuggestionId: null,
    refreshingSuggestions: false,
    // Filters applied to the search
    suggestions: []
}

export default function suggestion(state = initialState, { type, payload }) {
    switch (type) {
        case UPDATE_TERM: {
            var refreshingSuggestions = state.refreshingSuggestions;

            if(payload.length === 0)
                refreshingSuggestions = false;
            else if(state.suggestions.length > 0 && payload.length > 0)
                refreshingSuggestions = true;

            return {
                ...state,
                hoveredSuggestionId: null,
                refreshingSuggestions,
                suggestions: []
            }
        }
        case HOVER_SUGGESTION: {
            //logger.debug('[suggestion.HOVER_SUGGESTION] called', payload);
            return {
                ...state,
                hoveredSuggestionId: payload
            }
        }
        case MOUSE_OUT_SUGGESTION: {
            return {
                ...state,
                hoveredSuggestionId: null
            }
        }
        /*case SHOW_SUGGESTION: {
            const { suggestions } = payload
            //logger.debug('[suggestion.SHOW_SUGGESTION] called', payload);

            return {
                ...state,
                hoveredSuggestionId: null,
                refreshingSuggestions: false,
                suggestions
            }
        }*/
        default:
            return state
    }
}
