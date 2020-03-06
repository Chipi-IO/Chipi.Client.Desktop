export interface IMagicFilterState {
  searchId: string;
  magicFilterSuggestion: any;
  highlightedSuggestionIndex: number;
}

export interface IMagicFilterActionTypes {
  type: string;
  payload?: any;
}
