import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, X, Sparkles, Pause } from 'lucide-react';

const StudioVideosCarousel = ({ videos = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);

  const activeVideos = videos.filter(v => v.active !== false);

  // 1-Minute (60,000ms) Auto-rotation timer (pauses when a video is playing)
  useEffect(() => {
    if (activeVideos.length <= 1 || isPaused || playingVideoId !== null) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeVideos.length);
    }, 60000);

    return () => clearInterval(interval);
  }, [activeVideos.length, isPaused, playingVideoId]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeVideos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeVideos.length);
  };

  const getEmbedUrl = (url, platform) => {
    if (!url) return '';
    if (platform === 'youtube' || url.includes('youtube') || url.includes('youtu.be')) {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
      return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&playsinline=1&modestbranding=1` : url;
    }
    if (platform === 'vimeo' || url.includes('vimeo')) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : url;
    }
    return url;
  };

  const isDirectVideo = (url) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.endsWith('.webm') || url.startsWith('/uploads/') || url.includes('blob:');
  };

  if (!activeVideos || activeVideos.length === 0) return null;

  return (
    <section
      style={{ padding: '90px 0', backgroundColor: 'var(--bg-primary)', position: 'relative' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <span style={{ color: 'var(--color-gold)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} /> Behind the Scenes
          </span>
          <h2 className="serif-title-medium" style={{ color: 'var(--color-burgundy)', marginTop: 8, letterSpacing: '0.04em' }}>
            STRAIGHT FROM THE STUDIO
          </h2>
          <div style={{ width: 50, height: 2, backgroundColor: 'var(--color-gold)', margin: '14px auto 0 auto' }}></div>
        </div>

        {/* Carousel Container */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          
          {/* Prev Arrow */}
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: -20,
              zIndex: 20,
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '1px solid rgba(106,91,83,0.15)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-burgundy)',
              transition: 'transform 0.2s, background 0.2s',
            }}
            aria-label="Previous video"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Cards Grid */}
          <div
            ref={containerRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 24,
              width: '100%',
              padding: '10px 0',
            }}
            className="studio-videos-grid"
          >
            {activeVideos.map((video, idx) => {
              const videoKey = video._id || `studio-video-${idx}`;
              const isPlaying = playingVideoId === videoKey;
              const hasVideo = Boolean(video.videoUrl);

              return (
                <div
                  key={videoKey}
                  onClick={() => {
                    if (!isPlaying) {
                      setPlayingVideoId(videoKey);
                    }
                  }}
                  style={{
                    position: 'relative',
                    aspectRatio: '9/16',
                    borderRadius: 20,
                    overflow: 'hidden',
                    cursor: isPlaying ? 'default' : 'pointer',
                    boxShadow: isPlaying ? '0 16px 40px rgba(0,0,0,0.35)' : '0 12px 30px rgba(44,34,30,0.12)',
                    border: isPlaying ? '2px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.7)',
                    background: '#000',
                    transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s',
                  }}
                  className={`studio-video-card ${isPlaying ? 'is-playing' : ''}`}
                >
                  {/* INLINE VIDEO PLAYER (Plays directly inside this div area) */}
                  {isPlaying ? (
                    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, background: '#000' }}>
                      {isDirectVideo(video.videoUrl) || video.videoPlatform === 'direct' ? (
                        <video
                          src={video.videoUrl}
                          autoPlay
                          playsInline
                          controls
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <iframe
                          src={getEmbedUrl(video.videoUrl, video.videoPlatform || 'youtube')}
                          title={video.title}
                          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                          allowFullScreen
                          frameBorder="0"
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            display: 'block',
                          }}
                        />
                      )}

                      {/* Close / Stop playing overlay button in top corner */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayingVideoId(null);
                        }}
                        aria-label="Stop video"
                        title="Close Video"
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          zIndex: 30,
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0, 0, 0, 0.75)',
                          border: '1px solid rgba(255, 255, 255, 0.4)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    /* THUMBNAIL & PLAY BUTTON (Click to play right inside this div) */
                    <>
                      {/* Thumbnail image */}
                      <img
                        src={video.thumbnailUrl || '/images/floral_musk.jpg'}
                        alt={video.title}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: 0.9,
                          transition: 'transform 0.6s ease',
                        }}
                        className="studio-img"
                      />

                      {/* Dark gradient overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.4) 100%)',
                        }}
                      />

                      {/* Top overlay badge */}
                      {video.tag && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            right: 16,
                            textAlign: 'center',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              background: 'rgba(0,0,0,0.6)',
                              backdropFilter: 'blur(6px)',
                              color: 'var(--color-gold-light)',
                              border: '1px solid rgba(197,160,89,0.35)',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              padding: '6px 12px',
                              borderRadius: 20,
                            }}
                          >
                            {video.tag}
                          </span>
                        </div>
                      )}

                      {/* Center Play Button Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.94)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                            transition: 'transform 0.3s ease, background 0.3s ease',
                          }}
                          className="play-icon-bubble"
                        >
                          <Play size={22} fill="var(--color-burgundy)" color="var(--color-burgundy)" style={{ marginLeft: 3 }} />
                        </div>
                      </div>

                      {/* Bottom title text overlay */}
                      <div style={{ position: 'absolute', bottom: 18, left: 16, right: 16, textAlign: 'center' }}>
                        <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                          {video.title}
                        </h4>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: -20,
              zIndex: 20,
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '1px solid rgba(106,91,83,0.15)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-burgundy)',
              transition: 'transform 0.2s, background 0.2s',
            }}
            aria-label="Next video"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <style>{`
        .studio-video-card:not(.is-playing):hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(44,34,30,0.25) !important;
        }
        .studio-video-card:not(.is-playing):hover .studio-img {
          transform: scale(1.08);
        }
        .studio-video-card:not(.is-playing):hover .play-icon-bubble {
          transform: scale(1.15);
          background-color: white !important;
        }
        @media (max-width: 768px) {
          .studio-videos-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 14px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default StudioVideosCarousel;
