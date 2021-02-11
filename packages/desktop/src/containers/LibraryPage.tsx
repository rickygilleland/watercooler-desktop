/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyAction, Dispatch, bindActionCreators } from "redux";
import { AuthState } from "../store/types/auth";
import { User } from "../store/types/user";
import { connect } from "react-redux";
import { createItem, getLibraryItems } from "../actions/library";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import Library from "../components/Library";

function mapStateToProps(state: {
  auth: AuthState;
  user: User;
  organization: { organization: any; users: any };
  library: { items: any; itemsOrder: any; loading: any; creating: any };
  settings: any;
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

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Library),
);
