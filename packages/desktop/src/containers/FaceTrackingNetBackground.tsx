/* eslint-disable @typescript-eslint/no-explicit-any */
import { connect } from "react-redux";
import FaceTrackingNetBackground from "../components/FaceTrackingNetBackground";

function mapStateToProps(state: { settings: any }) {
  return {
    settings: state.settings,
  };
}

export default connect(mapStateToProps)(FaceTrackingNetBackground);
