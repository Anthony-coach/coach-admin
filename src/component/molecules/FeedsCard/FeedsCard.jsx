"use client";

import { Eye } from "lucide-react";
import Image from "next/image";
import classes from "./FeedsCard.module.css";
import { MdOutlineMessage } from "react-icons/md";
import moment from "moment-timezone";
import { useEffect, useRef, useState } from "react";
import { mediaUrl, mergeClass } from "@/resources/utils/helper";
import Button from "@/component/atoms/Button";
import { GoScreenFull } from "react-icons/go";
import NoData from "@/component/atoms/NoData/NoData";

export default function FeedsCard({ feed, setIsOpen, onOpenComments }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const fullscreenImgRef = useRef(null);

  const mediaItems = [
    ...(feed.images?.map((img) => ({ type: "image", url: img.url })) || []),
    ...(feed.videos?.map((vid) => ({ type: "video", url: vid.url })) || []),
  ];

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (fullscreenImage && fullscreenImgRef.current) {
      if (fullscreenImgRef.current.requestFullscreen) {
        fullscreenImgRef.current.requestFullscreen();
      } else if (fullscreenImgRef.current.webkitRequestFullscreen) {
        fullscreenImgRef.current.webkitRequestFullscreen();
      } else if (fullscreenImgRef.current.mozRequestFullScreen) {
        fullscreenImgRef.current.mozRequestFullScreen();
      } else if (fullscreenImgRef.current.msRequestFullscreen) {
        fullscreenImgRef.current.msRequestFullscreen();
      }
    }
    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        setFullscreenImage(null);
      }
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [fullscreenImage]);

  return (
    <div className={classes.feedCard}>
      <div className={classes.feedHeader}>
        <div className={classes.authorInfo}>
          <div className={classes.authorAvatar}>
            <Image
              src={
                mediaUrl(feed?.isSubscriberPost ? feed?.postedBy?.photo : feed?.coach?.photo) || `/images/cms-images/profile.png`
              }
              alt={feed.author}
              width={50}
              height={50}
              className={classes.avatarImage}
            />
          </div>
          <div className={classes.authorDetails}>
            <h3 className={classes.authorName}>{feed?.isSubscriberPost ? feed?.postedBy?.fullName : feed?.coach?.fullName}</h3>
            <span className={mergeClass(classes.category, classes.subscriberPostCategory)}>{feed?.category?.name}</span>
          </div>
        </div>
        <div className={classes.feedDate}>
          {moment(feed?.createdAt).format("DD MMM YYYY")}
        </div>
      </div>
     {feed?.isSubscriberPost && <div className={classes.subscriberPostCoachDiv}>
          <p>Subscriber of Coach: </p>
          <p className={classes.subscriberPostCoach}>{feed?.coach?.fullName}<span className={classes.subscriberPostEmail}>, {feed?.coach?.email}</span></p>
      </div>}
      <div className={classes.feedContent}>
        <p className={classes.feedText}>{feed?.text}</p>
        {/* <div className={classes.feedMedia}>
          <div className={classes.videoThumbnail}>
            <Image
              src={feed.image || "/placeholder.svg"}
              alt="Basketball hoop"
              width={800}
              height={400}
              className={classes.thumbnailImage}
            />
            <button
              className={classes.playButton}
              onClick={() => setIsOpen(feed.id)}
            >
              <svg
                width="90"
                height="90"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="12" fill="rgba(0, 0, 0, 0.5)" />
                <path d="M16 12L10 16V8L16 12Z" fill="white" />
              </svg>
            </button>
          </div>
        </div> */}
        {/* image/video */}

        <div className={classes.feedVideoContainer}>
          {mediaItems.length > 0 ? (
            <div className={classes.feedVideo}>
              {mediaItems[currentSlide]?.type === "video" ? (
                <video
                  src={mediaUrl(mediaItems[currentSlide].url)}
                  poster="/Images/app-images/video-poster.jpg"
                  controls
                />
              ) : (
                mediaItems[currentSlide]?.type === "image" && (
                  <>
                    <Image
                      ref={
                        fullscreenImage === mediaItems[currentSlide].url
                          ? fullscreenImgRef
                          : null
                      }
                      src={
                        mediaUrl(mediaItems[currentSlide].url) ||
                        "/placeholder.svg"
                      }
                      fill
                      alt="Feed content"
                      style={{
                        cursor: "zoom-in",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <Button
                      className={classes.fullscreenBtn}
                      onClick={() =>
                        setFullscreenImage(mediaItems[currentSlide].url)
                      }
                      type="button"
                      rightIcon={<GoScreenFull size={24} color="#fff" />}
                    />
                  </>
                )
              )}
            </div>
          ) : (
            <div className={classes.noMedia}>
              <NoData text="No media found" />
            </div>
          )}

          {mediaItems.length > 1 && (
            <div className={classes.swiperControls}>
              <div className={classes.paginationDots}>
                {mediaItems.map((_, index) => (
                  <button
                    key={index}
                    className={`${classes.paginationDot} ${
                      currentSlide === index ? classes.activeDot : ""
                    }`}
                    onClick={() => goToSlide(index)}
                  ></button>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* image/video */}
        <div className={classes.feedStats}>
          <div
            className={classes.likesCount}
            onClick={() => onOpenComments(feed?.slug)}
          >
            <MdOutlineMessage size={20} color="#B0CD6E" />
            <span>{feed?.commentsCount || 0} Comments</span>
          </div>
          <div className={classes.viewsCount}>
            <Eye size={16} color="#71717a" />
            {feed?.views < 100 ? (
              <span className={classes.lowViews}>less than 100 Views </span>
            ) : (
              <span>{feed?.views} Views</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
