import React from 'react';

class VideoPlayer extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        

    }

    componentDidUpdate(prevProps, prevState) {
       
    }

    render() {

        const { renderVideo, stream, publisher } = this.props;

        return(
            <video autoPlay ref={renderVideo(stream)} className={!publisher.id.includes("_screensharing") ? 'video-flip rounded shadow' : 'rounded shadow'} style={{height:"100%",width:"100%"}}></video>
        )
    }
}

export default VideoPlayer;