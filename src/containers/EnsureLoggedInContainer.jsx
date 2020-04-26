import React, { ReactNode } from 'react';
import { bindActionCreators, dispatch } from 'redux';
import { push } from 'connected-react-router'
import { getRooms } from '../actions/room';
import { connect } from 'react-redux';
import { setRedirectUrl } from '../actions/auth';

class EnsureLoggedInContainer extends React.Component {
    componentDidMount() {
      const { dispatch, currentURL, auth, organization } = this.props

      if ((!auth.isLoggedIn || auth.loginError) && currentURL != "/login") {

        dispatch(setRedirectUrl({ redirectUrl: currentURL }));
        dispatch(push("/login"));
      }

    }

    componentDidUpdate() {
      const { dispatch, currentURL, auth, organization } = this.props

      if ((!auth.isLoggedIn || auth.loginError) && currentURL != "/login") {
        dispatch(setRedirectUrl({ redirectUrl: currentURL }));
        dispatch(push("/login"));
      }
      
    }
  
    render() {
        const {auth} = this.props;
      if (auth.isLoggedIn) {
        return this.props.children
      } else {
        return null
      }
    }
  }

  function mapStateToProps(state, ownProps) {
    return {
      auth: state.auth,
      organization: state.room.organization,
      currentURL: ownProps.location.pathname
    }
  }
  
  export default connect(mapStateToProps)(EnsureLoggedInContainer)