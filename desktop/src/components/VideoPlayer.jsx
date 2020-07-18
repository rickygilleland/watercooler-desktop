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

        const { renderVideo, stream, publisher, isLocal, videoIsFaceOnly } = this.props;

        let className = 'shadow';
        
        if (!publisher.id.includes("_screensharing")) {
            className = className + " video-flip";
        }

        if (videoIsFaceOnly) {
            className = className + " border-radius-round";
        }

        return(
            <video autoPlay ref={renderVideo(stream)} muted={isLocal} className={className} style={{height:"100%",width:"100%", borderRadius: 25}}></video>
        )
    }
}

export default VideoPlayer;