export interface ISearchState {
  // Search term in main input
  term: string;
  // Index of selected output item
  searchingInFlight: boolean;
  searchId?: string;
  // Force to trigger search
  autoSearch: boolean;
  autocomplete?: any; // { value, startIndex, matchTerm}
  error?: any;
}

export interface ISearchActionTypes {
  type: string;
  payload?: any;
}
