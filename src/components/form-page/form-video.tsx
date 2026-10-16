"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

export const VENDOR_VIDEO = {
  src: "/assets/vendor-form/list-your-product.mp4",
  poster: "/assets/vendor-form/list-your-product-poster.jpg",
  // Source is 2160×2700; the frame uses the same 4:5 ratio, so nothing is cropped or letterboxed.
  width: 1080,
  height: 1350,
};

export function FormVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  // Autoplay can be blocked (data saver, background tab); reflect the real state.
  useEffect(() => {
    const el = video.current;
    if (el) setPlaying(!el.paused);
  }, []);

  const togglePlay = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) void el.play(); else el.pause();
  };
  const toggleMute = () => {
    const el = video.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  return (
    <div className="vf-video">
      <video
        ref={video}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={VENDOR_VIDEO.poster}
        width={VENDOR_VIDEO.width}
        height={VENDOR_VIDEO.height}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
      >
        <source src={VENDOR_VIDEO.src} type="video/mp4" />
      </video>
      <div className="vf-video__controls">
        <button type="button" onClick={togglePlay} aria-label={playing ? "Pause video" : "Play video"}>
          {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
        </button>
        <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute video" : "Mute video"}>
          {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
