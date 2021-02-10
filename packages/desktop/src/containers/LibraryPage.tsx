import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import Library from "../components/Library";
import { getLibraryItems, createItem } from "../actions/library";

function mapStateToProps(state) {
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

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getLibraryItems,
      createItem,
      push,
    },
    dispatch
  );
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Library)
);
