/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConnectedProps, connect } from "react-redux";
import { SettingsState } from "../store/types/settings";
import BlurNetBackground from "../components/BlurNetBackground";

function mapStateToProps(state: { settings: SettingsState }) {
  return {
    settings: state.settings,
  };
}

const connector = connect(mapStateToProps);
export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(BlurNetBackground);
