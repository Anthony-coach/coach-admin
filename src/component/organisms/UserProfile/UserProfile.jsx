"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import classes from "./UserProfile.module.css";
import TestimonialCard from "@/component/molecules/TestimonialCard/TestimonialCard";
import NoData from "@/component/atoms/NoData/NoData";
// import { testimonialsData } from "@/developmentContent/usersPageData";
import {
  MdOutlineLocalPhone,
  MdOutlineMail,
  MdOutlineStar,
} from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { IoPlaySharp } from "react-icons/io5";
import BorderWrapper from "@/component/atoms/BorderWrapper";
import { mediaUrl } from "@/resources/utils/helper";

export default function UserProfile({ userData }) {
  console.log("🚀 ~ UserProfile ~ userData:", userData)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollTimerRef = useRef(null);
  const testimonialsPerPage = 3;

  // Check for pending profile items
  const getPendingItems = () => {
    if (userData?.status !== "pending") return [];
    
    const pendingItems = [];
    
    // Check bio
    if (!userData?.bio || userData.bio.trim() === "") {
      pendingItems.push("Bio is not provided");
    }
    
    // Check categories
    if (!userData?.categories || userData.categories.length === 0) {
      pendingItems.push("Sports Category is not selected");
    }
    
    // Check cover photo
    if (userData?.coverPhoto === "defaultCover.jpg") {
      pendingItems.push("Cover photo is not provided by the coach and a dummy image is being used");
    }
    
    // Check profile photo
    if (userData?.photo === "default.png") {
      pendingItems.push("Profile photo is not provided by the coach and a dummy image is being used");
    }
    
    // Check intro video
    if (!userData?.introVideo) {
      pendingItems.push("Intro video is not provided");
    }
    
    return pendingItems;
  };

  const pendingItems = getPendingItems();

  const totalPages = Math.ceil((userData?.reviews?.length || 0) / testimonialsPerPage);
 
  const defaultAvatar = "/images/app-images/user-avatar.png";
  const resolvedImage = userData?.photo
    ? mediaUrl(userData.photo)
    : defaultAvatar;

  const defaultThumbnail = "/images/dummy-images/thumbnail.jpeg";
  const resolvedThumbnail = userData?.introVideoThumbnail
    ? mediaUrl(userData.introVideoThumbnail)
    : defaultThumbnail;

  // Cover photo with fallback
  const defaultCoverPhoto = "/images/dummy-images/thumbnail.jpeg";
  const resolvedCoverPhoto = userData?.coverPhoto
    ? mediaUrl(userData.coverPhoto)
    : defaultCoverPhoto;

  const getSocialUrl = (name) =>
    userData?.socialLinks?.find((link) => link.name === name)?.url;

  // Get current reviews to display
  const getCurrentReviews = () => {
    const startIndex = currentPage * testimonialsPerPage;
    return userData?.reviews?.slice(
      startIndex,
      startIndex + testimonialsPerPage
    ) || [];
  };

  // Auto-scroll functionality
  useEffect(() => {
    // Clear any existing timer
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }

    // Only set up timer if not paused
    if (!isPaused) {
      autoScrollTimerRef.current = setInterval(() => {
        setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
      }, 5000); // Change page every 5 seconds
    }

    // Clean up the timer when component unmounts or isPaused changes
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [isPaused, totalPages]);

  const handlePageChange = (pageIndex) => {
    // Temporarily pause auto-scroll when user manually changes page
    setIsPaused(true);
    setCurrentPage(pageIndex);

    setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  const handleTestimonialHover = () => {
    setIsPaused(true);
  };

  const handleTestimonialLeave = () => {
    setIsPaused(false);
  };

  return (
    <BorderWrapper>
      <div className={classes.container}>
        {/* Pending Items Section */}
        {pendingItems.length > 0 && (
          <div className={classes.pendingItemsSection}>
            <h3 className={classes.pendingTitle}>Profile Completion Required</h3>
            <ul className={classes.pendingList}>
              {pendingItems.map((item, index) => (
                <li key={index} className={classes.pendingItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cover Photo Section */}
        <div className={classes.coverPhotoSection}>
          <div className={classes.coverPhotoContainer}>
            <Image
              src={resolvedCoverPhoto}
              alt="Cover photo"
              width={1200}
              height={300}
              className={classes.coverPhoto}
            />
            <div className={classes.coverOverlay}>
              <div className={classes.profileInfoOverlay}>
                <div className={classes.avatarOverlay}>
                  <Image
                    src={resolvedImage}
                    alt="Profile picture"
                    width={120}
                    height={120}
                    className={classes.avatarOverlayImage}
                  />
                </div>
                <div className={classes.userInfoOverlay}>
                  <h1 className={classes.nameOverlay}>{userData?.fullName}</h1>
                  <div className={classes.ratingOverlay}>
                    <MdOutlineStar size={20} fill="#F29267" />
                    <span>{userData?.rating} Cricket Rating</span>
                  </div>
                  <div className={classes.locationOverlay}>
                    <CiLocationOn size={16} fill="#B0CD6E" />
                    <span>{userData?.country}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={classes.profileGrid}>
          {/* Profile Section */}
          <div className={classes.profileSection}>
            {/* <div className={classes.profileHeader}>
              <Image
                src={resolvedImage}
                alt="Profile picture"
                width={120}
                height={120}
                className={classes.avatar}
              />
              <div>
                <h1 className={classes.name}>{userData?.fullName}</h1>
                <div className={classes.rating}>
                  <MdOutlineStar size={24} fill="#F29267" />

                  <span>{userData?.rating} Cricket Rating</span>
                </div>
              </div>
            </div> */}

            <div>
              <h2 className={classes.sectionTitle}>Bio</h2>
              <p className={classes.bioText}>{userData?.bio}</p>
            </div>

            <div className={classes.contactInfo}>
              <div className={classes.contactItem}>
                <MdOutlineMail
                  className={classes.contactIcon}
                  fill="#F29267"
                  size={24}
                />
                <span>{userData?.email}</span>
              </div>
              <div className={classes.contactItem}>
                <MdOutlineLocalPhone
                  className={classes.contactIcon}
                  fill="#F29267"
                  size={24}
                />
                <span>{userData?.phoneNumber}</span>
              </div>
              <div className={classes.contactItem}>
                <CiLocationOn
                  className={classes.contactIcon}
                  fill="#F29267"
                  size={24}
                />
                <span>{userData?.country}</span>
              </div>
            </div>

            <div className={classes.socialLinks}>
              <h3 className={classes.socialTitle}>Social Links</h3>
              <div className={classes.socialIcons}>
                <Link
                  href={getSocialUrl("twitter") || "#"}
                  className={classes.twitterIcon}
                  target="_blank"
                >
                  <FaTwitter fill="#B0CD6E" size={20} />
                </Link>
                <Link
                  href={getSocialUrl("facebook") || "#"}
                  className={classes.phoneIcon}
                  target="_blank"
                >
                  <FaFacebookF fill="#B0CD6E" size={20} />
                </Link>
                <Link
                  href={getSocialUrl("instagram") || "#"}
                  className={classes.instagramIcon}
                  target="_blank"
                >
                  <FaInstagram fill="#B0CD6E" size={20} />
                </Link>
              </div>
            </div>

             <div className={classes.allowPostsDiv}>
              <h3 className={classes.socialTitle}>Accepting uploads from subscribers: </h3>
              <p className={classes.allowSubscriberPosting}>{userData?.allowSubscriberPosting ? 'Yes' : 'No'}</p>
            </div>

            <div className={classes.bankDetails}>
              <h2 className={classes.sectionTitle}>Bank Details</h2>
              <div className={classes.bankInfo}>
                <div className={classes.bankItem}>
                  <span className={classes.bankLabel}>Account Holder Name: </span>
                  <span className={classes.bioText}>{userData?.banksDetails?.accountHolderName}</span>
                </div>
                <div className={classes.bankItem}>
                  <span className={classes.bankLabel}>Account Number: </span>
                  <span className={classes.bioText}>{userData?.banksDetails?.accountNumber}</span>
                </div>
                <div className={classes.bankItem}>
                  <span className={classes.bankLabel}>Bank Name: </span>
                  <span className={classes.bioText}>{userData?.banksDetails?.bankName}</span>
                </div>
                
                
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className={classes.videoSection}>
            <h2 className={classes.videoTitle}>Intro Video</h2>
            <div className={classes.videoContainer}>
              {!isPlaying ? (
                <>
                  <Image
                    src={resolvedThumbnail}
                    alt="Video thumbnail"
                    width={600}
                    height={400}
                    className={classes.videoThumbnail}
                  />
                  <div className={classes.playButtonContainer}>
                    <button
                      className={classes.playButton}
                      onClick={() => setIsPlaying(true)}
                    >
                      <IoPlaySharp fill="#0B0B0B" size={24} />
                    </button>
                  </div>
                </>
              ) : (
                <div className={classes.videoPlayerWrapper}>
                  <video
                    className={classes.videoPlayer}
                    controls
                    autoPlay
                    src={mediaUrl(userData?.introVideo)}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <button
                    className={classes.closeVideoButton}
                    onClick={() => setIsPlaying(false)}
                    aria-label="Close video"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div
          className={classes.reviewsSection}
          onMouseEnter={handleTestimonialHover}
          onMouseLeave={handleTestimonialLeave}
        >
          <h2 className={classes.reviewsTitle}>Review & Rating</h2>

          {userData?.reviews && userData.reviews.length > 0 ? (
            <>
              <div
                className={`${classes.reviewsGrid} ${classes.fadeTransition}`}
                key={currentPage}
              >
                {getCurrentReviews().map((review) => (
                  <TestimonialCard key={review?._id} review={review} />
                ))}
              </div>

              {/* Pagination Dots */}
              {totalPages > 1 && (
                <div className={classes.paginationDots}>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      className={`${classes.paginationButton} ${
                        index === currentPage
                          ? classes.activeDot
                          : classes.inactiveDot
                      }`}
                      onClick={() => handlePageChange(index)}
                      aria-label={`Page ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <NoData text="No reviews available" />
          )}
        </div>
      </div>
    </BorderWrapper>
  );
}
