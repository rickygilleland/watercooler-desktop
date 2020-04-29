import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import { withRouter } from 'react-router-dom';
import { getOrganizationUsers, inviteUsers } from '../actions/organization';
import Team from '../components/Team';

function mapStateToProps(state) {
    return {
        auth: state.auth,
        user: state.user,
        organization: state.organization.organization,
        organizationUsers: state.organization.users,
        organizationLoading: state.organization.loading,
        teams: state.organization.teams,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        getOrganizationUsers,
        inviteUsers,
        push
      },
      dispatch
    );
  }

  export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Team))
