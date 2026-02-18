"use client";
import Button from "@/component/atoms/Button";
import { Input } from "@/component/atoms/Input";
import { Loader } from "@/component/atoms/Loader";
import Tabs from "@/component/atoms/Tabs/Tabs";
import TopHeader from "@/component/atoms/TopHeader";
import DropDown from "@/component/molecules/DropDown/DropDown";
import UsersTable from "@/component/molecules/UsersTable";
import FeedsCom from "@/component/organisms/FeedsCom";
import Subscription from "@/component/organisms/Subscription/Subscription";
import UserProfile from "@/component/organisms/UserProfile/UserProfile";
import { coachTabs } from "@/developmentContent/enums/enum";
import useAxios from "@/interceptor/axiosInterceptor";
import useDebounce from "@/resources/hooks/useDebounce";
import { Country } from "country-state-city";
import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import classes from "./CoachDetailTemplate.module.css";

import NoData from "@/component/atoms/NoData/NoData";
import RenderToast from "@/component/atoms/RenderToast";
import axios from "axios";
import { BaseURL } from "@/resources/utils/helper";
import { useSelector } from "react-redux";
import momentTimezone from "moment-timezone";
import {
  FEED_ARCHIVED_OPTIONS,
  USER_STATUS_OPTIONS,
  SUBSCRIBER_STATUS_OPTIONS,
} from "@/developmentContent/dropdownOption";
import { RECORDS_LIMIT } from "@/const";
import AreYouSureModal from "@/component/molecules/Modal/AreYouSureModal";
import RejectionReasonModal from "@/component/molecules/Modal/RejectionReasonModal";

const CoachDetailTemplate = ({ slug }) => {
  const [SelectedTabs, setSelectedTabs] = useState(coachTabs[0]);

  const { Get, Patch } = useAxios();
  const { accessToken } = useSelector((state) => state.authReducer);
  const [usersData, setUsersData] = useState(null);
  const [loading, setLoading] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [feedsData, setFeedsData] = useState([]);
  const [feedsLoading, setFeedsLoading] = useState("");
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 500);
  const [feedsStatus, setFeedsStatus] = useState(USER_STATUS_OPTIONS[0]);
  const [feedsCategory, setFeedsCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(feedsCategory[0]); // Country selection state
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [archived, setArchived] = useState(FEED_ARCHIVED_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [subscribersData, setSubscribersData] = useState(null);
  const [waitingListCount, setWaitingListCount] = useState(0);

  // Subscriber specific states
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [subscriberStatus, setSubscriberStatus] = useState(
    SUBSCRIBER_STATUS_OPTIONS[0]
  );
  const [subscriberCountry, setSubscriberCountry] = useState(null);
  const [subscriberPage, setSubscriberPage] = useState(1);
  const [subscriberTotalRecords, setSubscriberTotalRecords] = useState(0);
  const debounceSubscriberSearch = useDebounce(subscriberSearch, 500);

  // Accept/Reject functionality states
  const [showModal, setShowModal] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  // Get all countries for dropdown
  const countries = Country.getAllCountries().map((country) => ({
    label: country.name,
    value: country.isoCode,
  }));

  // Function to get pending profile items (same logic as UserProfile)
  const getPendingItems = (userData) => {
    if (userData?.status !== "pending") return [];
    
    const pendingItems = [];
    
    // Check bio
    if (!userData?.bio || userData.bio.trim() === "") {
      pendingItems.push("Bio");
    }
    
    // Check categories
    if (!userData?.categories || userData.categories.length === 0) {
      pendingItems.push("Sports Category");
    }
    
    // Check cover photo
    if (userData?.coverPhoto === "defaultCover.jpg") {
      pendingItems.push("Cover photo");
    }
    
    // Check profile photo
    if (userData?.photo === "default.png") {
      pendingItems.push("Profile photo");
    }
    
    // Check intro video
    if (!userData?.introVideo) {
      pendingItems.push("Intro video");
    }
    
    return pendingItems;
  };

  const getData = async () => {
    setLoading("initial");
    const { response } = await Get({
      route: `admin/users/${slug}`,
    });
    if (response) {
      setUsersData(response.data);
    }
    setLoading("");
  };

  const getSubscribersData = async ({
    coachSlug = slug,
    pg = subscriberPage,
    _search = debounceSubscriberSearch,
    _status = subscriberStatus,
    _country = subscriberCountry,
  }) => {
    if (loading === "loading") return;

    console.log("getSubscribersData called with:", {
      coachSlug,
      pg,
      _search,
      _status,
      _country,
    });

    const params = {
      coachSlug,
      page: pg,
      search: _search,
      limit: RECORDS_LIMIT,
      ...(_status && _status.value !== "all" && { status: _status.value }),
      ...(_country && _country.value && { country: _country.label }),
    };
    const query = new URLSearchParams(params).toString();
    console.log("Subscriber query:", query);

    setLoading("loading");
    const { response } = await Get({
      route: `admin/coach/subscribers?${query}`,
    });

    if (response) {
      setSubscribersData(response.data);
      setSubscriberPage(pg);
      setSubscriberTotalRecords(response.totalRecords || 0);
    }
    setLoading("");
  };

  const getFeedsData = async ({
    _search = debounceSearch,
    _status = feedsStatus,
    _category = selectedCategory?._id,
    _archived = archived.value,
    _page = page,
  }) => {
    if (feedsLoading === "loading") return;

    const params = {
      coachSlug: slug,
      search: _search,
      ...(_status && { status: _status?.value }),
      ...(_category && { category: _category }),
      isArchived: _archived,
      page: _page,
    };
    const query = new URLSearchParams(params).toString();

    setFeedsLoading("loading");

    const { response } = await Get({
      route: `admin/feeds?${query}`,
    });

    if (response) {
      setFeedsData((prevData) =>
        _page === 1 ? response?.data : [...(prevData || []), ...response?.data]
      );
      setTotalRecords(response?.totalRecords || 0);
      setPage(_page);
    }
    setFeedsLoading("");
  };

  const editSubscription = async (values) => {
    setEditLoading(true);
    const { response } = await Patch({
      route: `admin/users/coach/subscription/update/${slug}`,
      data: {
        subscriptionCost: values.price,
      },
    });

    if (response) {
      setUsersData((prev) => ({
        ...prev,
        subscriptionCost: values.price,
      }));

      RenderToast({
        message: "Subscription updated successfully",
        type: "success",
      });
      // return true;
    }
    setEditLoading(false);
  };

  const getCategoryData = async (coachSlug = slug) => {
    const params = {
      coachSlug,
      type: "feed",
    };
    const query = new URLSearchParams(params).toString();
    const { response } = await Get({
      route: `admin/categories?${query}`,
    });
    if (response) {
      const categories = response.data;
      setFeedsCategory(categories);
      if (categories.length > 0 && !selectedCategory) {
        setSelectedCategory(categories[0]);
      }
    }
    setLoading(false);
  };

  // Handle country change
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
  };

  // Handle subscriber country change
  const handleSubscriberCountryChange = (country) => {
    console.log("Country selected:", country);
    setSubscriberCountry(country);
  };

  // Handle coach status change (accept/reject)
  const handleCoachStatus = async (values) => {
    setActionLoading("coachStatus");

    const payload = {
      status: showModal === "accept" ? "approved" : "rejected",
      ...(values && { rejectionReason: values.rejectReason }),
    };

    const { response , error } = await Patch({
      route: `admin/users/coach/status/${slug}`,
      data: payload,
      showAlert: false
    });
    console.log("🚀 ~ handleCoachStatus ~ response:", response)

    if (response) {
      RenderToast({
        type: "success",
        message: `Coach ${
          showModal === "accept" ? "approved" : "rejected"
        } successfully`,
      });
      // Update the local user data
      setUsersData((prev) => ({
        ...prev,
        status: showModal === "accept" ? "approved" : "rejected",
      }));
      setShowModal("");
    }
    else if ( error && error?.message?.error[0] == 'Coach profile is not completed' && error?.statusCode == 400 ) {
      console.log('101error' ,error?.statusCode, error?.message?.error[0] )
      
      // Get pending items and show error toast
      const pendingItems = getPendingItems(usersData);
      if (pendingItems.length > 0) {
        const pendingItemsText = pendingItems.join(', ');
        RenderToast({
          type: "error",
          message: `${pendingItems.includes("Sports Category")} ? 'sports category is not provided by the coach' : 'Coach profile is not completed'`,
          // `${pendingItemsText} ${pendingItems?.length > 1 ? 'are' : 'is'} not provided by the coach`,
        });
      } else {
        RenderToast({
          type: "error",
          message: "Coach profile is not completed",
        });
      }
    }
    setActionLoading("");
    setShowModal("");
  };

  const handleAccept = () => {
    setShowModal("accept");
  };

  const handleReject = () => {
    setShowModal("reject");
  };

  const handleDownloadTransactions = async () => {
    setDownloadLoading(true);
    try {
      const query = {
        coachSlug: slug,
        transactionType: "subscription",
      };
      const queryString = new URLSearchParams(query).toString();
      const url = BaseURL(`admin/transactions/download/csv?${queryString}`);
      const response = await axios.get(url, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          timezone: momentTimezone.tz.guess(),
        },
      });
      const blob = new Blob([response.data], { type: "text/csv" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `transactions-${slug}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      // Check if this is the specific "No transactions found" error
      const errorMessage = err?.response?.data?.message?.error;
      if (Array.isArray(errorMessage) && errorMessage.length > 0) {
        const firstError = errorMessage[0];
        if (firstError && firstError.includes("No transactions found")) {
          RenderToast({
            message: "No transactions found",
            type: "error",
          });
        } else {
          // For other errors, show the original error message
          RenderToast({
            message: firstError || "No transactions found",
            type: "error",
          });
        }
      } else {
        // Fallback for other error types
        RenderToast({
          message: "No transactions found.",
          type: "error",
        });
      }
      console.log("error in downloading");
    }
    setDownloadLoading(false);
  };

   const getWaitingListCount = async () => {
    const { response } = await Get({ route: `coach-waiting/count/${usersData?._id}` });
    if (response) {
      setWaitingListCount(response?.data?.count);
    }
  };

  useEffect(() => {
    getData();
    getCategoryData();
    if (SelectedTabs.value === "feeds") {
      getFeedsData({
        _search: debounceSearch,
        _status: feedsStatus,
        _category: selectedCategory?._id,
        _archived: archived.value,
      });
    } else if (SelectedTabs.value === "users") {
      getSubscribersData({
        pg: 1,
        _search: debounceSubscriberSearch,
        _status: subscriberStatus,
        _country: subscriberCountry,
      });
    }
  }, [
    slug,
    debounceSearch,
    feedsStatus,
    selectedCategory,
    SelectedTabs.value,
    archived,
    debounceSubscriberSearch,
    subscriberStatus,
    subscriberCountry,
  ]);

  // Separate useEffect for subscriber data
  useEffect(() => {
    if (SelectedTabs.value === "users") {
      getSubscribersData({
        pg: 1,
        _search: debounceSubscriberSearch,
        _status: subscriberStatus,
        _country: subscriberCountry,
      });
    }
  }, [
    SelectedTabs.value,
    debounceSubscriberSearch,
    subscriberStatus,
    subscriberCountry,
  ]);

    // Get waiting list count
    useEffect(() => {
      usersData && getWaitingListCount();
    }, [usersData]);

  return (
    <div>
      <TopHeader title={"coaches"} slug={`/${usersData?.fullName}`}></TopHeader>
      {loading === "initial" && !usersData ? (
        <div className={classes?.loaderContainer}>
          <Loader />
        </div>
      ) : (
        <>
          <div className={classes?.tabs}>
            <Tabs
              activeTab={SelectedTabs}
              setActiveTab={setSelectedTabs}
              tabs={coachTabs}
            />
            {SelectedTabs.value === "profile" ? (
                <div className={classes?.actionButtons}>
                 {usersData?.status === "pending" && <Button
                    label="Accept"
                    variant="success"
                    onClick={handleAccept}
                    className={classes?.acceptButton}
                  />}
                {usersData?.status === "pending" && <Button
                    label="Reject"
                    variant="outlined"
                    onClick={handleReject}
                    className={classes?.rejectButton}
                  />}
                  <button 
                    className={classes.downloadButton} 
                    onClick={handleDownloadTransactions}
                    disabled={downloadLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    {downloadLoading ? "Downloading..." : "Download Transactions"}
                  </button>
                </div>
            ) : SelectedTabs.value === "feeds" ? (
              <div className={classes?.main}>
                <Input
                  mainContClassName={classes?.mainContClassName}
                  placeholder={"Search By Name"}
                  rightIcon={<IoSearchOutline color="#B0CD6E" size={20} />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {/* <DropDown 
                  placeholder={"Location"} 
                  value={feedsCategory}
                  setValue={setFeedsCategory}
                /> */}
                <DropDown
                  placeholder={"Status"}
                  value={feedsStatus}
                  setValue={setFeedsStatus}
                  options={USER_STATUS_OPTIONS}
                />
                <DropDown
                  placeholder={"Archived"}
                  value={archived}
                  setValue={setArchived}
                  options={FEED_ARCHIVED_OPTIONS}
                />
              </div>
            ) : SelectedTabs.value === "users" ? (
              <div className={classes?.main}>
                <Input
                  mainContClassName={classes?.mainContClassName}
                  placeholder={"Search By Name"}
                  rightIcon={<IoSearchOutline color="#B0CD6E" size={20} />}
                  value={subscriberSearch}
                  onChange={(e) => setSubscriberSearch(e.target.value)}
                />
                <DropDown
                  placeholder={"Country"}
                  value={subscriberCountry}
                  setValue={handleSubscriberCountryChange}
                  options={countries}
                />
                <DropDown
                  placeholder={"Status"}
                  value={subscriberStatus}
                  setValue={setSubscriberStatus}
                  options={SUBSCRIBER_STATUS_OPTIONS}
                />
              </div>
            ) : (
              ""
            )}
          </div>
          <div className={classes?.coachTop}>
            {SelectedTabs.value === "users" ? (
              <UsersTable
                subscribersData={subscribersData}
                loading={loading === "loading"}
                page={subscriberPage}
                setPage={setSubscriberPage}
                totalRecords={subscriberTotalRecords}
                getData={getSubscribersData}
                currentFilters={{
                  _search: debounceSubscriberSearch,
                  _status: subscriberStatus,
                  _country: subscriberCountry,
                }}
              />
            ) : SelectedTabs.value === "profile" ? (
              <UserProfile userData={usersData} waitingListCount={waitingListCount} />
            ) : SelectedTabs.value === "subscriptionCost" ? (
              <Subscription
                editSubscription={editSubscription}
                userData={usersData}
                loading={editLoading}
              />
            ) : SelectedTabs.value === "feeds" ? (
              <FeedsCom
                feedsData={feedsData}
                setSearch={setSearch}
                setFeedsCategory={setSelectedCategory}
                feedsCategory={feedsCategory}
                loading={feedsLoading === "loading"}
                totalRecords={totalRecords}
                page={page}
                setPage={setPage}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            ) : (
              <NoData text="No data " />
            )}
          </div>
        </>
      )}

      {/* Accept/Reject Modals */}
      {showModal === "reject" && (
        <RejectionReasonModal
          show={showModal === "reject"}
          setShow={setShowModal}
          onConfirm={handleCoachStatus}
          loading={actionLoading === "coachStatus"}
        />
      )}

      {showModal === "accept" && (
        <AreYouSureModal
          show={showModal === "accept"}
          setShow={setShowModal}
          heading="Approve Coach"
          subheading="Are you sure you want to approve this coach?"
          confirmButtonLabel={
            actionLoading === "coachStatus" ? "Submitting..." : "Confirm"
          }
          cancelButtonLabel="Cancel"
          confirmButtonVariant="success"
          cancelButtonVariant="green-outlined"
          onConfirm={() => {
            handleCoachStatus();
          }}
        />
      )}
    </div>
  );
};

export default CoachDetailTemplate;
