export const GET_ITEMS_STARTED = "GET_ITEMS_STARTED";
export const GET_ITEMS_SUCCESS = "GET_ITEMS_SUCCESS";
export const GET_ITEMS_FAILURE = "GET_ITEMS_FAILURE";
export const CREATE_ITEM_STARTED = "CREATE_ITEM_STARTED";
export const CREATE_ITEM_SUCCESS = "CREATE_ITEM_SUCCESS";
export const CREATE_ITEM_FAILURE = "CREATE_ITEM_FAILURE";
export const ADD_NEW_ITEM_FROM_NOTIFICATION_SUCCESS =
  "ADD_NEW_ITEM_FROM_NOTIFICATION_SUCCESS";

export interface LibraryItem {
  id: number;
  user_id: number;
  organization_id: number;
  path: string;
  mime_type: string;
  slug: string;
  processed: boolean;
  is_public: boolean;
  temporary_url: string;
}

export interface LibraryGroup {
  [itemId: number]: LibraryItem;
}

export interface LibraryState {
  items: LibraryGroup;
  itemsOrder: LibraryItem[];
  loading: boolean;
  creating: boolean;
  error: boolean;
}

interface GetItemsStartedAction {
  type: typeof GET_ITEMS_STARTED;
}

interface GetItemsSuccessAction {
  type: typeof GET_ITEMS_SUCCESS;
  payload: LibraryItem[];
}

interface GetItemsFailedAction {
  type: typeof GET_ITEMS_FAILURE;
}

interface CreateItemStartedAction {
  type: typeof CREATE_ITEM_STARTED;
}

interface CreateItemSuccessAction {
  type: typeof CREATE_ITEM_SUCCESS;
  payload: LibraryItem;
}

interface CreateItemFailedAction {
  type: typeof CREATE_ITEM_FAILURE;
}

interface AddNewItemFromNotificationSuccessAction {
  type: typeof ADD_NEW_ITEM_FROM_NOTIFICATION_SUCCESS;
  payload: LibraryItem;
}

export type LibraryActionTypes =
  | GetItemsStartedAction
  | GetItemsSuccessAction
  | GetItemsFailedAction
  | CreateItemStartedAction
  | CreateItemSuccessAction
  | CreateItemFailedAction
  | AddNewItemFromNotificationSuccessAction;
