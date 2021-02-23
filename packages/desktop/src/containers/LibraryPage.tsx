/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { AuthState } from "../store/types/auth";
import { ConnectedProps, connect } from "react-redux";
import { LibraryState } from "../store/types/library";
import { OrganizationState } from "../store/types/organization";
import { SettingsState } from "../store/types/settings";
import { User } from "../store/types/user";
import { createItem, getLibraryItems } from "../actions/library";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import Library from "../components/Library";

function mapStateToProps(state: {
  auth: AuthState;
  user: User;
  organization: OrganizationState;
  library: LibraryState;
  settings: SettingsState;
}) {
  return {
    auth: state.auth,
    user: state.user,
    organization: state.organization.organization,
    organizationUsers: state.organization.users,
    libraryItems: state.library.items,
    libraryItemsOrder: state.library.itemsOrder,
    libraryLoading: state.library.loading,
    libraryItemCreating: state.library.creating,
    settings: state.settings,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return bindActionCreators(
    {
      getLibraryItems,
      createItem,
      push,
    },
    dispatch,
  );
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(Library));
