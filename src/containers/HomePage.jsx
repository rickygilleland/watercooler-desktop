import React from 'react';
import { getRooms } from '../actions/room';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Home from '../components/Home';

function mapStateToProps(state) {
    return {
        rooms: state.rooms
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        getRooms,
      },
      dispatch
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)