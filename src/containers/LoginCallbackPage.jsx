import React from 'react';
import { authenticateUser } from '../actions/auth';
import { getUserDetails } from '../actions/user';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { push } from 'connected-react-router';
import LoginCallback from '../components/LoginCallback';

function mapStateToProps(state) {
    return {
        auth: state.auth,
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        authenticateUser,
        getUserDetails,
        push,
      },
      dispatch
    );
  }
  
export default connect(mapStateToProps, mapDispatchToProps)(LoginCallback)