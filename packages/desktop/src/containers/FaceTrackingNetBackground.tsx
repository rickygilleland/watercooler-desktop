import React from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import FaceTrackingNetBackground from "../components/FaceTrackingNetBackground";

function mapStateToProps(state) {
  return {
    settings: state.settings,
  };
}

export default connect(mapStateToProps)(FaceTrackingNetBackground);
