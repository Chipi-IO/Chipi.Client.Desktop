export interface IOutputState {
  results?: any[];
  suggestions?: any[];
  visibleSuggestions?: any[];
  outputs?: any[];
  highlightedOutputItem?: any;
  highlightedOutputIndex: number;
  searchId?: string;
  hasNoFoundItems: boolean;
  searchedTerm?: string;
  updatedResultItem?: any;
}

export interface IOutputActionTypes {
  type: string;
  payload?: any;
}
