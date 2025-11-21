"use client";
import BorderWrapper from "@/component/atoms/BorderWrapper";
import { Input } from "@/component/atoms/Input";
import TopHeader from "@/component/atoms/TopHeader";
import CommentsModal from "@/component/molecules/CommentsModal/CommentsModal";
import DropDown from "@/component/molecules/DropDown/DropDown";
import FeedsCard from "@/component/molecules/FeedsCard/FeedsCard";
import VideoModalSkeleton from "@/component/molecules/VideoModalSkeleton";
import useAxios from "@/interceptor/axiosInterceptor";
import useDebounce from "@/resources/hooks/useDebounce";
import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import classes from "./FeedsTemplate.module.css";
import { Loader } from "@/component/atoms/Loader";
import {
  FEED_ARCHIVED_OPTIONS,
  FEED_STATUS_OPTIONS,
} from "@/developmentContent/dropdownOption";
import NoData from "@/component/atoms/NoData/NoData";
import { RECORDS_LIMIT } from "@/const";
import Button from "@/component/atoms/Button";
import { useSearchParams } from "next/navigation";
import RenderToast from "@/component/atoms/RenderToast";

const FeedsTemplate = () => {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";
  const { Get, Delete } = useAxios();
  const [selectedDate, setSelectedDate] = useState("Jan 24, 2023");
  // const [selectedFeed, setSelectedFeed] = useState("All");
  const [isOpenVideo, setIsOpenVideo] = useState(false);
  const [activeFeedSlug, setActiveFeedSlug] = useState(null);
  const [loading, setLoading] = useState("");
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 500);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [feedsData, setFeedsData] = useState([]);
  const [status, setStatus] = useState(FEED_STATUS_OPTIONS[0]);
  const [archived, setArchived] = useState(FEED_ARCHIVED_OPTIONS[0]);

  const getData = async ({
    page = currentPage,
    search = debouncedSearch,
    status: statusParam,
    isArchived: isArchivedParam,
  }) => {
    setLoading("loading");
    const params = {
      page,
      limit: RECORDS_LIMIT,
      search,
      status: statusParam ?? status.value,
      isArchived: isArchivedParam ?? archived.value,
    };
    const queryParams = new URLSearchParams(params).toString();

    const { response } = await Get({
      route: `admin/feeds?${queryParams}`,
    });

    if (response) {
      console.log("🚀 ~ FeedsTemplate ~ responseFeed00:", response);
      setFeedsData((prevData) =>
        page === 1 ? response?.data : [...(prevData || []), ...response?.data]
      );
      setTotalRecords(response?.totalRecords || 0);
      setCurrentPage(page);
    }

    setLoading("");
  };

  useEffect(() => {
    getData({ page: 1 });
  }, [debouncedSearch, status, archived]);

  const handleOpenVideo = (feedId) => {
    setActiveFeedSlug(feedId);
    setIsOpenVideo(true);
  };

  const handleCloseVideo = () => {
    setIsOpenVideo(false);
    setActiveFeedSlug(null);
  };

  const handleOpenComments = (feedSlug) => {
    setActiveFeedSlug(feedSlug);
    setIsCommentsOpen(true);
  };

  const handleCloseComments = () => {
    setIsCommentsOpen(false);
    setActiveFeedSlug(null);
  };

  const handleCommentDeleted = () => {
    // Update the comment count for the active feed
    if (activeFeedSlug) {
      setFeedsData((prevFeeds) =>
        prevFeeds.map((feed) =>
          feed.slug === activeFeedSlug
            ? {
                ...feed,
                commentsCount: Math.max(0, (feed.commentsCount || 0) - 1),
              }
            : feed
        )
      );
    }
  };

  const handleDeleteFeed = async (feedSlug) => {
    const { response, error } = await Delete({
      route: `admin/feeds/${feedSlug}`,
    });

    if (response && !error) {
      RenderToast({
        type: "success",
        message: "Feed deleted successfully",
      });
      // Remove the deleted feed from the list
      setFeedsData((prevFeeds) =>
        prevFeeds.filter((feed) => feed.slug !== feedSlug)
      );
      setTotalRecords((prev) => Math.max(0, prev - 1));
    } else {
      throw new Error("Failed to delete feed");
    }
  };

  if (loading === "loading") {
    return <Loader />;
  }

  return (
    <>
      <TopHeader title="Feed">
        <Input
          mainContClassName={classes?.customStyle}
          placeholder={"Search By Name"}
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          rightIcon={<IoSearchOutline color="#B0CD6E" size={20} />}
        />
        <DropDown
          placeholder={"Feed"}
          options={FEED_STATUS_OPTIONS}
          value={status}
          setValue={setStatus}
        />
        <DropDown
          placeholder={"Feed"}
          options={FEED_ARCHIVED_OPTIONS}
          value={archived}
          setValue={setArchived}
        />
      </TopHeader>
      <div className={classes?.mainWrapper}>
        <div className={classes.feedsList}>
          {feedsData?.length > 0 ? (
            feedsData?.map((feed, index) => (
              <BorderWrapper key={index}>
                <FeedsCard
                  key={index}
                  feed={feed}
                  onOpenComments={() => handleOpenComments(feed?.slug)}
                  setIsOpen={handleOpenVideo}
                  onDelete={handleDeleteFeed}
                />
              </BorderWrapper>
            ))
          ) : (
            <NoData text="No Feeds found" />
          )}
          {totalRecords > RECORDS_LIMIT && (
            <div className={classes?.loadMoreContainer}>
              <Button
                variant={"outlined"}
                className={classes?.loadMoreButton}
                onClick={() => {
                  setCurrentPage(currentPage + 1);
                  getData({ page: currentPage + 1 });
                }}
              >
                {loading === "loading" ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      </div>
      <CommentsModal
        isOpen={isCommentsOpen}
        onClose={handleCloseComments}
        feedSlug={activeFeedSlug}
        onCommentDeleted={handleCommentDeleted}
      />
      <VideoModalSkeleton
        isOpen={isOpenVideo}
        setIsOpenVideo={setIsOpenVideo}
        onClose={handleCloseVideo}
      />
    </>
  );
};

export default FeedsTemplate;
