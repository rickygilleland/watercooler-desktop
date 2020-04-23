import React from 'react';
import { userLogout } from '../actions/auth';
import { getRooms } from '../actions/room';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import { withRouter } from 'react-router-dom'
import Sidebar from '../components/Sidebar';

function mapStateToProps(state) {
    return {
        user: state.user,
        organization: state.room.organization,
        teams: state.room.teams,
        auth: state.auth,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        userLogout,
        getRooms,
        push,
      },
      dispatch
    );
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sidebar))