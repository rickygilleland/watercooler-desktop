import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import { withRouter } from 'react-router-dom';
import MessageThread from '../components/MessageThread';
import { getThreadMessages } from '../actions/thread';

function mapStateToProps(state) {
    return {
        auth: state.auth,
        user: state.user,
        organization: state.organization.organization,
        organizationUsers: state.organization.users,
        publicThreads: state.thread.publicThreads,
        privateThreads: state.thread.privateThreads,
        sharedThreads: state.thread.sharedThreads,
        threadLoading: state.thread.loading,
        settings: state.settings,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        getThreadMessages,
        push
      },
      dispatch
    );
  }

  export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MessageThread))
