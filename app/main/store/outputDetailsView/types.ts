export interface IOutputDetailsViewState {
  showingDetailsView: boolean;
  detailsViewActions?: any[];
  detailsItem?: any;
}

export interface IOuputDetailsViewActionTypes {
  type: string;
  payload?: any;
}
