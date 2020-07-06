import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import BlurNetBackground from '../components/BlurNetBackground';

function mapStateToProps(state) {
    return {
        settings: state.settings
    }
}

export default connect(mapStateToProps)(BlurNetBackground)