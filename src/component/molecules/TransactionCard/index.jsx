"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, ChevronDown } from "lucide-react";
import classes from "./TransactionCard.module.css";
import { capitalizeFirstLetter, getMonthName, mediaUrl } from "@/resources/utils/helper";
import useAxios from "@/interceptor/axiosInterceptor";
import RenderToast from "@/component/atoms/RenderToast";
import Button from "@/component/atoms/Button";

const TransactionCard = ({ item, transactionType, getData }) => {
  console.log("🚀 ~ TransactionCard ~ item:", item)
  

  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState("");
  const { Patch } = useAxios();
  const { coach, status, email , withdrawalStatus, _id} = item;
  const defaultAvatar = "/images/app-images/user-avatar.png";
  if (!coach?.fullName && !coach?.photo) return null;

  const resolvedImage = coach?.photo ? mediaUrl(coach?.photo) : defaultAvatar;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMarkAsPaid = async () => {
    setLoading("paid");
    const { response } = await Patch({
      route: `admin/transactions/mark-as-sent/${item?._id}`,
    });
    if (response) {
      RenderToast({
        type: "success",
        message: "Transaction marked as paid",
      });
      if (getData) {
        getData();
      }
    }
    setLoading("");
  };


  return (
    <div className={classes.transactionCard}>
      <div className={classes.header} onClick={toggleExpand}>
        <div className={classes.profileSection}>
          <div className={classes.profileImage}>
            <Image
              src={resolvedImage}
              alt={coach?.fullName}
              fill
              className={classes.avatar}
            />
          </div>
          <div className={classes.profileInfo}>
            <div className={classes.name}>
              <span className={classes.nameSpan}>{coach?.fullName}</span>
              <div className={classes.statusBadge}>
                <span className={classes.statusDot}></span>
                <span className={classes.statusText}>{transactionType?.value === "subscription" && status === "deposit" ? "Completed" : transactionType.value === "withdrawal" && withdrawalStatus === "pending" ? "Pending"  : withdrawalStatus}</span>
              </div>
            </div>
            <div className={classes.emailContainer}>
              <span className={classes.email}>{coach?.email || "-"}</span>
            </div>
          </div>
        </div>
        <button className={classes.expandButton}>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className={classes.content}>
          <div className={classes.transactionItem}>
            <div className={classes.transactionDetails}>
              <div className={classes.detailRow}>
                <span className={classes.detailLabel}>Coach Name</span>
                <span className={classes.detailValue}>
                  {item?.coach?.fullName || "-"}
                </span>
              </div>
              <div className={classes.detailRow}>
                <span className={classes.detailLabel}>Month</span>
                <span className={classes.detailValue}>
                  {`${getMonthName(item?.createdAt) || "-"}`}
                </span>
              </div>
              <div className={classes.detailRow}>
                <span className={classes.detailLabel}>Subscribers</span>
                <span className={classes.detailValue}>
                  {item?.totalSubscribers ?? "-"}
                </span>
              </div>             
              <div className={classes.detailRow}>
                <span className={classes.detailLabel}>Total</span>
                <span className={classes.detailValue}>
                £{ transactionType?.value === "withdrawal" ? item?.amount : item?.totalAmount ?? "0"}
                </span>
              </div>
            </div>
            {transactionType?.value === "withdrawal" && withdrawalStatus === "pending" && (
              <div className={classes.buttonContainer}>
                <Button
                  label={loading === "paid" ? "Processing..." : "Mark as Paid"}
                  onClick={handleMarkAsPaid}
                  disabled={loading === "paid"}
                  variant="primary"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;
