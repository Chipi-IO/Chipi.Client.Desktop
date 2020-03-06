export interface IFullConversation {
  conversationItems: () => Promise<ISearchResultItem[]>;
  currentResultItemId: string;
}

export interface ISearchResultItemAction {
  name: string;
  longName?: string;
  keys: string;
  fn: Function;
  ignoreWhenTextHighlighted?: boolean;
  availableInDetailsView?: boolean;

  /**
   * Deprecated
   */
  allowedActions?: string[];
}

export interface IChipiChannelSearchResultModel {
  icon?: any;
  fromChannel: string;
  primaryName: string;
  secondaryName?: string;
  primaryImage?: string;
  domain?: string;
  channelOnClick?: Function;
}

export interface IChipiTunnelSearchResultModel {}

export interface IChipiSearchResultItem {
  channel: IChipiChannelSearchResultModel;
  tunnel?: IChipiTunnelSearchResultModel; 
  mimeType?: {
    icon?: string;
    name: string;
    normalizedName: string;
  };
}

export interface ISearchResultItem {
  id: string;
  chipi?: IChipiSearchResultItem;
  account: string;
  icon?: string;
  title: string;
  subtitle?: string;
  sentByPerson?: {
    image?: string;
    title: string;
  };
  avatars?: {
    src?: string;
    title: string;
  }[];
  timestamp: Date;
  text?: string;
  htmlContent?: string;
  breadcrumbTitle?: string;
  onSelect: Function;
  getPreview?: Function;
  fullConversation?: IFullConversation;
  actions?: ISearchResultItemAction[];
}

export interface IChipiFoundItem {
  foundItem?: any;
  additionalData?: any;
  searchTerm?: string;
  /**
   * Deprecated, use clientActions instead
   */
  actions?: any;
  clientActions?: any;
}
