import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import { withRouter } from 'react-router-dom';
import MessageThread from '../components/MessageThread';

function mapStateToProps(state) {
    return {
        auth: state.auth,
        user: state.user,
        organization: state.organization.organization,
        organizationUsers: state.organization.users,
        settings: state.settings,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        push
      },
      dispatch
    );
  }

  export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MessageThread))
