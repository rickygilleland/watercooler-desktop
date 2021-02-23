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
  const { auth, currentURL, dispatch } = props;

  useEffect(() => {
    if (
      (!auth.isLoggedIn || auth.loginError) &&
      currentURL != "/login" &&
      !currentURL.includes("/magic/login")
    ) {
      if (auth.redirectUrl === currentURL) {
        return dispatch(push("/login"));
      }

      dispatch(setRedirectUrl(currentURL));
      dispatch(push("/login"));
    }

    if (auth.isLoggedIn && currentURL != "/" && currentURL != "/loading") {
      setShowChildren(true);
    } else {
      setShowChildren(false);
    }
  }, [
    auth.isLoggedIn,
    auth.loginError,
    auth.redirectUrl,
    currentURL,
    dispatch,
  ]);

  if (!showChildren) {
    null;
  }

  return props.children;
}

function mapStateToProps(
  state: { auth: AuthState; organization: { organization: OrganizationState } },
  ownProps: { currentURL: string },
) {
  return {
    auth: state.auth,
    organization: state.organization.organization,
    currentURL: ownProps.currentURL,
  };
}

export default connect(mapStateToProps)(EnsureLoggedInContainer);
