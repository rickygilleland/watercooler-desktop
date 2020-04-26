import React from 'react';
import { authenticateUser } from '../actions/auth';
import { getUserDetails } from '../actions/user';
import { getRooms } from '../actions/room';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { withRouter } from 'react-router-dom'
import { push } from 'connected-react-router';
import Login from '../components/Login';

function mapStateToProps(state) {
    return {
        auth: state.auth,
        user: state.user,
        organization: state.room.organization,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        authenticateUser,
        getUserDetails,
        getRooms,
        push,
      },
      dispatch
    );
  }
  
  export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login))