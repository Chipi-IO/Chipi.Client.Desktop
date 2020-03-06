export interface IFullThreadState {
    resultItem?: any;
}

export type FullThreadLoaded = {
  type: string;
  payload: {
    resultItem: any;
  };
};

export type FullThreadActionTypes = FullThreadLoaded;
