import React from 'react';
import { userLogout } from '../actions/auth';
import { getOrganizations, getOrganizationUsers } from '../actions/organization';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import { withRouter } from 'react-router-dom'
import Sidebar from '../components/Sidebar';

function mapStateToProps(state, ownProps) {
    return {
        user: state.user,
        organization: state.organization.organization,
        organizationUsers: state.organization.users,
        organizationLoading: state.organization.loading,
        teams: state.organization.teams,
        auth: state.auth,
        currentURL: ownProps.location.pathname
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        userLogout,
        getOrganizations,
        getOrganizationUsers,
        push,
      },
      dispatch
    );
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sidebar))