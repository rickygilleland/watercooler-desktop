import React, { ReactNode } from 'react';
import { bindActionCreators, dispatch } from 'redux';
import { push } from 'connected-react-router'
import { connect } from 'react-redux';
import { setRedirectUrl } from '../actions/auth';

class EnsureLoggedInContainer extends React.Component {
    componentDidMount() {
      const { dispatch, currentURL, isLoggedIn } = this.props

      if (!isLoggedIn) {
        dispatch(setRedirectUrl(currentURL));
        dispatch(push("/login"));
      }
    }
  
    render() {
        const {isLoggedIn} = this.props;
      if (isLoggedIn) {
        return this.props.children
      } else {
        return null
      }
    }
  }

  function mapStateToProps(state, ownProps) {
    return {
      isLoggedIn: state.auth.isLoggedIn,
      currentURL: ownProps.location.pathname
    }
  }
  
  export default connect(mapStateToProps)(EnsureLoggedInContainer)