/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthState } from "../store/types/auth";
import { OrganizationState } from "../store/types/organization";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { setRedirectUrl } from "../actions/auth";
import { useEffect, useState } from "react";

interface EnsureLoggedInContainerProps {
  children: any;
  dispatch: any;
  currentURL: string;
  auth: AuthState;
  organization: OrganizationState;
}

function EnsureLoggedInContainer(
  props: EnsureLoggedInContainerProps,
): JSX.Element {
  const [showChildren, setShowChildren] = useState(false);

  useEffect(() => {
    if (
      (!props.auth.isLoggedIn || props.auth.loginError) &&
      props.currentURL != "/login" &&
      !props.currentURL.includes("/magic/login")
    ) {
      if (props.auth.redirectUrl === props.currentURL) {
        return props.dispatch(push("/login"));
      }

      props.dispatch(setRedirectUrl({ redirectUrl: props.currentURL }));
      props.dispatch(push("/login"));
    }

    if (
      props.auth.isLoggedIn &&
      props.currentURL != "/" &&
      props.currentURL != "/loading"
    ) {
      setShowChildren(true);
    } else {
      setShowChildren(false);
    }
  }, [
    props.auth.isLoggedIn,
    props.auth.loginError,
    props.auth.redirectUrl,
    props.currentURL,
  ]);

  if (!showChildren) {
    null;
  }

  return props.children;
}

function mapStateToProps(
  state: { auth: AuthState; organization: { organization: any } },
  ownProps: { location: { pathname: any } },
) {
  return {
    auth: state.auth,
    organization: state.organization.organization,
    currentURL: ownProps.location.pathname,
  };
}

export default connect(mapStateToProps)(EnsureLoggedInContainer);
