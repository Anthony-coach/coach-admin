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

const TransansactionTemplate = () => {

  const { Get} = useAxios();
  
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
