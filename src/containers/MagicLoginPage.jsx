import React from 'react';
import { authenticateUserMagicLink } from '../actions/auth';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { withRouter } from 'react-router-dom'
import { push } from 'connected-react-router';
import MagicLogin from '../components/MagicLogin';

function mapStateToProps(state) {
    return {
        auth: state.auth,
        user: state.user,
        organization: state.organization.organization,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        authenticateUserMagicLink,
        push,
      },
      dispatch
    );
  }
  
  export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MagicLogin))