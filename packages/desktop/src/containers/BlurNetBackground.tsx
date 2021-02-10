/* eslint-disable @typescript-eslint/no-explicit-any */
import { connect } from "react-redux";
import BlurNetBackground from "../components/BlurNetBackground";

function mapStateToProps(state: { settings: any }) {
  return {
    settings: state.settings,
  };
}

export default connect(mapStateToProps)(BlurNetBackground);
