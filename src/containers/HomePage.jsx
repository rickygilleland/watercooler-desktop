import React from 'react';
import { userLogout } from '../actions/auth';
import { getRooms } from '../actions/room';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Home from '../components/Home';

function mapStateToProps(state) {
    return {
        user: state.user,
        organization: state.room.organization,
        teams: state.room.teams
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        userLogout,
        getRooms,

      },
      dispatch
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)