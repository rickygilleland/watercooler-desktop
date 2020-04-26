import React from 'react';
import { getRooms } from '../actions/room';
import { getUserDetails } from '../actions/user';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import { withRouter } from 'react-router-dom'
import Loading from '../components/Loading';

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
        getRooms,
        getUserDetails,
        push,
      },
      dispatch
    );
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Loading))