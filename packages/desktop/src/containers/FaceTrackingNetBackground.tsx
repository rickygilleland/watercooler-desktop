/* eslint-disable @typescript-eslint/no-explicit-any */
import { SettingsState } from "../store/types/settings";
import { connect } from "react-redux";
import FaceTrackingNetBackground from "../components/FaceTrackingNetBackground";

function mapStateToProps(state: { settings: SettingsState }) {
  return {
    settings: state.settings,
  };
}

export default connect(mapStateToProps)(FaceTrackingNetBackground);
