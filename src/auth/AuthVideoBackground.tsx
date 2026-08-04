import React from "react";

const AuthVideoBackgroundComponent = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden transform-gpu">
      <div className="absolute inset-0 hidden lg:block">
        <video
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          preload="metadata"
          poster="/img/freepik-video-upscaler-480.jpg"
          className="h-full w-full object-cover"
        >
          <source src="/img/freepik-video-upscaler-480.webm" type="video/webm" />
          <source src="/img/freepik-video-upscaler-480.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="absolute inset-x-0 top-0 h-[42vh] lg:hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          preload="metadata"
          poster="/img/freepik-video-upscaler-480.jpg"
          className="h-full w-full object-cover"
        >
          <source src="/img/freepik-video-upscaler-480.webm" type="video/webm" />
          <source src="/img/freepik-video-upscaler-480.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="absolute inset-0 bg-slate-950/72 lg:bg-slate-950/68" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.16),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/45 to-slate-950/92 lg:from-slate-950/10 lg:via-slate-950/50 lg:to-slate-950/82" />
    </div>
  );
};

export const AuthVideoBackground = React.memo(AuthVideoBackgroundComponent);