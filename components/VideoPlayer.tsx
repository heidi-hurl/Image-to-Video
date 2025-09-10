
import React from 'react';

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <video
        src={src}
        controls
        autoPlay
        loop
        muted
        className="w-full h-auto rounded-lg shadow-lg"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
