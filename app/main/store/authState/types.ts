export interface IAuthState {
  isAuthenticated: Boolean;
  user: any;
  userName?: string;
  accessToken: any;
  idToken: any;
  isAuthenticating: boolean;
  isOffline: boolean;
}

export interface IAuthStateActionTypes {
  type: any;
  payload?: any;
}

//initialState
