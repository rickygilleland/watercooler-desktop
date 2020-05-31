import React, { ReactNode } from 'react';
import { bindActionCreators, dispatch } from 'redux';
import { push } from 'connected-react-router'
import { getOrganizations } from '../actions/organization';
import { connect } from 'react-redux';
import { setRedirectUrl } from '../actions/auth';

class EnsureLoggedInContainer extends React.Component {
    componentDidMount() {
      const { dispatch, currentURL, auth, organization } = this.props

      if ((!auth.isLoggedIn || auth.loginError) && (currentURL != "/login" && !currentURL.includes("/magic/login"))) {
        if (auth.redirectUrl == currentUrl) {
          return dispatch(push("/login"));
        }

        dispatch(setRedirectUrl({ redirectUrl: currentURL }));
        dispatch(push("/login"));
      }

    }

    componentDidUpdate() {
      const { dispatch, currentURL, auth, organization } = this.props

      if ((!auth.isLoggedIn || auth.loginError) && (currentURL != "/login" && !currentURL.includes("/magic/login"))) {
        if (auth.redirectUrl == currentUrl) {
          return dispatch(push("/login"));
        }
        dispatch(setRedirectUrl({ redirectUrl: currentURL }));
        dispatch(push("/login"));
      }
      
    }
  
    render() {
      const {auth,currentURL} = this.props;
      if (auth.isLoggedIn && currentURL != "/" && currentURL != "/loading") {
        return this.props.children
      } else {
        return null
      }
    }
  }

  function mapStateToProps(state, ownProps) {
    return {
      auth: state.auth,
      organization: state.organization.organization,
      currentURL: ownProps.location.pathname
    }
  }
  
  export default connect(mapStateToProps)(EnsureLoggedInContainer)