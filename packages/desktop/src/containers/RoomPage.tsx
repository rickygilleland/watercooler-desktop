/* eslint-disable @typescript-eslint/no-explicit-any */
import { connect, ConnectedProps } from "react-redux";
import { getRoomUsers, addUserToRoom } from "../actions/room";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import Room from "../components/Room";

function mapStateToProps(state: {
  auth: any;
  user: any;
  organization: { organization: any; billing: any; users: any; teams: any };
  room: { loading: any; addUserLoading: any; users: any };
  settings: any;
}) {
  return {
    auth: state.auth,
    user: state.user,
    organization: state.organization.organization,
    billing: state.organization.billing,
    organizationUsers: state.organization.users,
    teams: state.organization.teams,
    roomLoading: state.room.loading,
    addUserLoading: state.room.addUserLoading,
    roomUsers: state.room.users,
    settings: state.settings,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return bindActionCreators(
    {
      getRoomUsers,
      addUserToRoom,
      push,
    },
    dispatch,
  );
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(Room));
