/* eslint-disable @typescript-eslint/no-explicit-any */
import { SettingsState } from "../store/types/settings";
import { connect } from "react-redux";
import BlurNetBackground from "../components/BlurNetBackground";

function mapStateToProps(state: { settings: SettingsState }) {
  return {
    settings: state.settings,
  };
}

export default connect(mapStateToProps)(BlurNetBackground);
