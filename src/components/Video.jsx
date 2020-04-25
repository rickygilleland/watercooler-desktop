import React from 'react';
import { Image } from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faVideoSlash } from '@fortawesome/free-solid-svg-icons';

class Video extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { videoSizes, publisher } = this.props;
    }

    componentDidUpdate(prevProps, prevState) {

    }

    componentWillUnmount() {

    }

    render() {
        const { videoSizes, publisher, renderVideo } = this.props;

        if (typeof publisher.stream != "undefined") {

            if (publisher.hasVideo === true) {
                return (
                    <div className="col p-0">
                        <div className="mx-auto position-relative text-light"  style={{height: videoSizes.height, width: videoSizes.width }}>
                            <video autoPlay ref={renderVideo(publisher.stream)} className="rounded shadow" style={{height: videoSizes.height, width: videoSizes.width }}></video>
                            <div className="position-absolute overlay" style={{bottom:0,backgroundColor:"rgb(18, 20, 34, .5)",width:"100%"}}>
                                <p className="pl-2 mb-1 mt-1 font-weight-bolder">{publisher.member.name}</p>
                            </div>
                        </div>
                    </div>
                )
            }

            return(
                <div className="col p-0">
                    <div className="rounded shadow mx-auto d-flex flex-column justify-content-center position-relative text-light" style={{height: videoSizes.height, width: videoSizes.width, backgroundColor:publisher.containerBackgroundColor }}>
                    <video autoPlay ref={renderVideo(publisher.stream)} className="rounded shadow" style={{height: 0, width: 0 }}></video>
                        <div className="mx-auto align-self-center">
                            <Image src={publisher.member.avatar} roundedCircle />
                            <p className="font-weight-bolder text-center" style={{paddingTop:5,fontSize:"1.5rem"}}><FontAwesomeIcon style={{color:"#f9426c"}} icon={faVideoSlash} /> Audio Only</p>
                        </div>
                        <div className="position-absolute overlay" style={{bottom:0,backgroundColor:"rgb(18, 20, 34, .5)",width:"100%"}}>
                            <p className="pl-2 mb-1 mt-1 font-weight-bolder">{publisher.member.name}</p>
                        </div>
                    </div>
                </div>
            )
        }

        return(
            <div className="col p-0">
                <div className="rounded shadow mx-auto d-flex flex-column justify-content-center position-relative text-light" style={{height: videoSizes.height, width: videoSizes.width, backgroundColor:publisher.containerBackgroundColor }}>
                    <div className="mx-auto align-self-center">
                        <Image src={publisher.member.avatar} roundedCircle />
                    </div>
                    <div className="position-absolute overlay" style={{bottom:0,backgroundColor:"rgb(18, 20, 34, .5)",width:"100%"}}>
                        <p className="pl-2 mb-1 mt-1 font-weight-bolder">{publisher.member.name}</p>
                    </div>
                </div>
            </div>
        )
    }

}

export default Video;