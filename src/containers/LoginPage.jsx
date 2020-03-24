import React from 'react';
import { authenticateUser } from '../actions/auth';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { push } from 'connected-react-router';
import Login from '../components/Login';

function mapStateToProps(state) {
    return {
        auth: state.auth,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        authenticateUser,
        push,
      },
      dispatch
    );
  }
  
export default connect(mapStateToProps, mapDispatchToProps)(Login)