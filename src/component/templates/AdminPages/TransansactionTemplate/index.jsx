"use client";
import TopHeader from "@/component/atoms/TopHeader";
import React, { useEffect, useState } from "react";
import classes from "./TransansactionTemplate.module.css";  
import TransactionCard from "@/component/molecules/TransactionCard";
import useAxios from "@/interceptor/axiosInterceptor";
import useDebounce from "@/resources/hooks/useDebounce";
import { TRANSACTION_STATUS_OPTIONS, TRANSACTION_TYPE_OPTIONS } from "@/developmentContent/dropdownOption";
import FilterHeader from "@/component/molecules/FilterHeader/FilterHeader";
import { Loader } from "@/component/atoms/Loader";
import NoData from "@/component/atoms/NoData/NoData";
import DropDown from "@/component/molecules/DropDown/DropDown";
import { RECORDS_LIMIT } from "@/const";
import PaginationComponent from "@/component/molecules/PaginationComponent";
import RenderToast from "@/component/atoms/RenderToast";
import axios from "axios";
import { BaseURL } from "@/resources/utils/helper";
import { useSelector } from "react-redux";
import momentTimezone from "moment-timezone";

const TransansactionTemplate = () => {

  const { Get} = useAxios();
  const { accessToken } = useSelector((state) => state.authReducer);
  
  const [transactionData, setTransactionData] = useState([]);
  const [loading, setLoading] = useState("");
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 500);
  const [status, setStatus] = useState(TRANSACTION_STATUS_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [transactionType, setTransactionType] = useState(TRANSACTION_TYPE_OPTIONS[0]);
 
  const getTransactionData = async ({
    _page = currentPage,
    _search = debounceSearch,
    status = status,
    _transactionType = transactionType,
  }) => {
    if (loading === "loading") return;

    setLoading("loading");
    const query = {
      page: _page,
      search: _search,
      limit: RECORDS_LIMIT,
      ...(_transactionType?.value && { transactionType: _transactionType?.value }),
    };

    // Only add status parameter if transaction type is "withdrawal"
    if (_transactionType?.value === "withdrawal" && status?.value && status?.value !== "all") {
      query.status = status?.value;
    }

    const queryString = new URLSearchParams(query).toString();
    const { response } = await Get({
      route: `admin/transactions?${queryString}`,
    });

    if (response) {
      setTransactionData(response?.data);
      setTotalRecords(response?.totalRecords);
    }

    setLoading("");
  };


  useEffect(() => {
    getTransactionData({ _search: debounceSearch, status: status, _transactionType: transactionType, _page:1 });
  }, [debounceSearch, status, transactionType]);

  const handleDownloadCSV = async () => {
    if (transactionData.length === 0) {
      RenderToast({
        message: "No transactions found",
        type: "error",
      });
      return;
    }
    setLoading("downloading");
    try {
      const query = {
        transactionType: transactionType?.value,
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
      link.download = `transactions-${
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
            message: firstError || "An error occurred while downloading",
            type: "error",
          });
        }
      } else {
        // Fallback for other error types
        RenderToast({
          message: "An error occurred while downloading",
          type: "error",
        });
      }
      console.log("error in downloading");
    }
    setLoading("");
  };
    
  return (
    <div>
      <TopHeader title="Transactions">
                 <FilterHeader
           inputPlaceholder="Search"
           searchValue={search}
           customStyle={{ width: "300px" }}
           onChange={(value) => {
             setSearch(value);
             setCurrentPage(1);
             
             
           }}
           showDropDown={true}
           dropdownOption={TRANSACTION_TYPE_OPTIONS}
           placeholder={"Transaction Type"}
           setValue={(value) => {
                         setSearch("");
              setTransactionType(value);
              setCurrentPage(1);
              setStatus(TRANSACTION_STATUS_OPTIONS[0]);
            }}
           value={transactionType}
         >
         {
          transactionType?.value === "withdrawal" && (
            <div className={classes.filterHeader}>
            <DropDown
              options={TRANSACTION_STATUS_OPTIONS}
              placeholder={"Status"}
              value={status}
                             setValue={(value) => {
                               setSearch("");
                 setStatus(value);
                 setCurrentPage(1);
               }}
            />
          </div> 
          )
         }
         <button 
           className={classes.downloadButton} 
           onClick={handleDownloadCSV}
           disabled={loading === "downloading" || loading === "loading"}
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
           Download CSV
         </button>
         </FilterHeader>
         
      </TopHeader>
      <div className={classes.transactionCardContainer}>
      {loading === "loading" ? (
        <Loader />
      ) : transactionData && transactionData.length > 0 ? (
        transactionData.map((item) => (
          <TransactionCard
            key={item._id}
           item={item}
           transactionType={transactionType}
           getData={() => getTransactionData({ _search: debounceSearch, status: status, _transactionType: transactionType, _page: currentPage })}
          />
        ))
      ) : (
        <NoData text="No transactions found" />
      )}
      </div>
      <PaginationComponent
      totalItems={totalRecords}
      currentPage={currentPage}
      onPageChange={(page) => {
        setCurrentPage(page);
        getTransactionData({ _search: debounceSearch, status: status, _transactionType: transactionType, _page:page });
      }}

    
      />
    </div>
  );
};

export default TransansactionTemplate;
