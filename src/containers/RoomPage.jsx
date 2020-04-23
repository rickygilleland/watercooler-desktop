import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import { withRouter } from 'react-router-dom'
import Room from '../components/Room';

function mapStateToProps(state) {
    return {
        auth: state.auth,
        user: state.user,
        organization: state.room.organization,
        teams: state.room.teams,
        rooms: state.room.rooms,
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

  export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Room))
