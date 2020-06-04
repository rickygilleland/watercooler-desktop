import React from 'react';
import { connect } from 'react-redux';
import { getRoomUsers, addUserToRoom } from '../actions/room';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import { withRouter } from 'react-router-dom'
import Room from '../components/Room';

function mapStateToProps(state) {
    return {
        auth: state.auth,
        user: state.user,
        organization: state.organization.organization,
        billing: state.organization.billing,
        organizationUsers: state.organization.users,
        teams: state.organization.teams,
        roomLoading: state.room.loading,
        addUserLoading: state.room.addUserLoading,
        roomUsers: state.room.users,
        settings: state.settings,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        getRoomUsers,
        addUserToRoom,
        push
      },
      dispatch
    );
  }

  export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Room))
