import CryptoJS from "crypto-js";

import axios from "axios";
import { toast } from "react-toastify";
import useAxios from "@/interceptor/axiosInterceptor";
import { config } from "@/config";
import moment from "moment-timezone";

// import { apiHeader } from "../../config/apiUrl";

export const API_URL = config.apiBaseURL;

export const S3_URL = config.s3BucketURL;
// 00
export const apiHeader = (token, isFormData) => {
  if (token && !isFormData) {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  }
  if (token && isFormData) {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };
  }
  if (!token && !isFormData) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  if (!token && isFormData) {
    return {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
  }
};
export const BaseURL = (link) => `${API_URL}/api/v1/${link}`;
export const mediaUrl = (url) => {
  if (!url) return "";
  const result = url.indexOf("http");
  if (result === -1) return `${S3_URL}/${url}`;
  return url;
};

export const mergeClass = (...classes) => {
  return classes.join(" ");
};

export const getFormattedPrice = (price, currency = "R") => {
  return `${currency}${parseFloat(price).toFixed(2)}`;
};

export function getLastSegment(url) {
  // Remove trailing slashes if there are any
  url = url.replace(/\/+$/, "");

  // Get the last segment after the last /
  var segments = url.split("/");
  return segments[segments.length - 1];
}

export const uploadToPresignedUrl = async (
  presignedUrl = "",
  selectedFile = null,
  setUploadProgress = () => {}
) => {
  try {
    return await axios.put(presignedUrl, selectedFile, {
      headers: {
        "Content-Type": "video",
      },

      onUploadProgress: (data) => {
        const progress = Math.round((100 * data.loaded) / data.total);

        setUploadProgress((prev) => (prev >= progress ? prev : progress));
      },
    });
  } catch (error) {
    return null;
  }
};

export const handleEncrypt = (message) => {
  const encrypted = CryptoJS.AES.encrypt(
    message,
    ACCESS_TOKEN_SECRET
  ).toString();
  return encrypted;
};

export const getImageResolutionMessage = ({
  lWidth,
  lHeight,
  rWidth,
  rHeight,
}) => {
  return toast.warn(
    `Image resolution if only ${lWidth}x${lHeight} pixels. For best quality print, we recommend at least ${rWidth}x${rHeight} pixels.`
  );
};

export const handleDecrypt = (encryptedMessage) => {
  if (encryptedMessage) {
    const decrypted = CryptoJS.AES.decrypt(
      encryptedMessage,
      ACCESS_TOKEN_SECRET
    ).toString(CryptoJS.enc.Utf8);
    return decrypted;
  }
};

const ACCESS_TOKEN_SECRET = "t2qckOEgV88Gp";

// export const uploadImages = async (images, token) => {
//   if (!images.length) return null;
//   const { Post } = useAxios();
//   const formData = new FormData();
//   images.forEach((image) => {
//     formData.append("photos", image);
//   });

//   const res = await Post(
//     BaseURL("media/upload"),
//     formData,
//     apiHeader(token, true)
//   );

//   if (res) {
//     return res.data?.data?.photos?.map((item) => item?.key);
//   }

//   return null;
// };

// export const uploadImagesHelper = async ({
//   images,
//   setIsLoading,
//   setImages,
//   token,
// }) => {
//   if (images.length === 0) return;
//   setIsLoading(true);
//   uploadImages(images, token)
//     .then((res) => {
//       if (res) {
//         setImages((prev) => [...prev, ...res]);
//       }
//       setIsLoading(false);
//     })
//     .finally(() => {
//       setIsLoading(false);
//     });
// };

// export const deleteMedia = async ({
//   slug,
//   key,
//   setIsLoading,
//   token,
//   setImages,
//   entity,
// }) => {
//   const { Patch } = useAxios();
//   const url = BaseURL("media/delete");
//   const params = { slug: slug, key, type: "image", entity };
//   setIsLoading(true);
//   const res = await Patch(url, params, apiHeader(token));
//   if (res) {
//     setImages((prev) => prev.filter((item) => item !== key));
//   }
//   setIsLoading(false);
// };

export const formRegEx = /([a-z])([A-Z])/g;
export const formRegExReplacer = "$1 $2";
export const capitalizeEachWord = (str) => {
  return str.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
};
export const getFormattedParams = (label) =>
  capitalizeEachWord(label.replace(formRegEx, formRegExReplacer));

export const validateParams = (params, specialMessages, skips = []) => {
  for (let key in params) {
    if (skips.includes(key)) continue;

    // special cases
    if (specialMessages && specialMessages[key]) {
      if (specialMessages[key].condition) {
        toast.warn(specialMessages[key].message);
        return false;
      }
    }

    if (!!!params[key]) {
      toast.warn(`${getFormattedParams(key)} is required.`);
      return false;
    }

    if (Array.isArray(params[key])) {
      // if 0 length
      if (params[key].length === 0) {
        toast.warn(`Add at least one ${getFormattedParams(key)}`);
        return false;
      }

      // if array and contains empty string
      if (params[key].some((item) => item === "")) {
        toast.warn(`Add valid ${getFormattedParams(key)}`);
        return false;
      }

      // validate array values
      for (let key2 in params[key]) {
        if (params[key][key2]) {
          const isValid = validateParams(params[key][key2], specialMessages);
          if (!isValid) return false;
        }
      }
    }
  }

  return true;
};

export const handleCreateStringifyParams = (params, stringifyFields) => {
  const newParams = { ...params };
  for (let key in newParams) {
    if (stringifyFields.includes(key)) {
      newParams[key] = JSON.stringify(newParams[key]);
    }
  }

  return newParams;
};

// get filtered object, only remove the given keys from the object
export const getFilteredObjectRemove = (object, keys) => {
  let filteredObject = { ...object };
  keys.forEach((key) => {
    delete filteredObject[key];
  });
  return filteredObject;
};

export const unWantedKeys = [
  "_id",
  "__v",
  "updatedAt",
  "createdAt",
  "__comment",
  "_comment",
  "updatedAt",
  "status",
];

export const getReadableName = (name) => {
  if (name === "cms") return "CMS";

  return name;
};

// check depth of object
export const getObjectDepth = (object) => {
  let level = 1;
  for (let key in object) {
    if (!object.hasOwnProperty(key) || typeof object[key] !== "object") {
      continue;
    }
    level += getObjectDepth(object[key]);
  }
  return level;
};

export const returnKeyEmptyAsPerType = (item) => {
  if (typeof item === "object") {
    if (Array.isArray(item)) {
      return [];
    } else {
      return returnFillObjectToEmptyWithSameKey(item);
    }
  } else if (typeof item === "string") {
    return "";
  }
};

export const returnFillObjectToEmptyWithSameKey = (object) => {
  let newObject = {};
  Object.keys(object).forEach((key) => {
    if (typeof object[key] === "object") {
      newObject[key] = returnFillObjectToEmptyWithSameKey(object[key]);
    } else if (typeof object[key] === "string") {
      newObject[key] = "";
    }
  });
  return newObject;
};

export const postVideoToS3 = async ({ video, url, setVideoProgress }) => {
  await axios
    .put(url, video, {
      headers: {
        "Content-Type": video.type,
      },
      onUploadProgress: (data) => {
        setVideoProgress(Math.round((100 * data.loaded) / data.total));
      },
    })
    .then(() => {
      // toast.success("Video updated successfully.");
      return true;
    })
    .catch(async (e) => {
      console.log("error in uploading video => ", e);
      toast.warn("Something went wrong. Please try again later.");
      return false;
    })
    .finally(() => {
      setVideoProgress(0);
    });
};

export const getNestedObject = (obj = {}, nestedKey = "") => {
  const keys = nestedKey.split(".");
  const value = keys.reduce((acc, currKey) => acc && acc[currKey], obj);
  return value;
};

export const validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const CreateFormData = (data) => {
  console.log("🚀 ~ data:", data);
  const formData = new FormData();
  for (let key in data) {
    if (Array.isArray(data[key])) {
      for (let d in data[key]) {
        if (typeof data[key][d] == "string") {
          formData.append(key, data[key][d]);
        } else if (
          data[key][d] instanceof File ||
          data[key][d] instanceof Date
        ) {
          formData.append(key, data[key][d]);
        } else {
          formData.append(key, JSON.stringify(data[key][d]));
        }
      }
    } else if (typeof data[key] == "object") {
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, JSON.stringify(data[key]));
      }
    } else {
      formData.append(key, data[key]);
    }
  }
  return formData;
};

export const firebaseVapidObject = {
  vapidKey: "",
};

export const capitalizeFirstLetter = (l) => {
  if (typeof l !== "string" || l.length === 0) {
    return "";
  }
  return l.charAt(0).toUpperCase() + l.slice(1);
};

export const formatPathname = (pathname) => {
  if (!pathname) return "Home";
  const name = pathname.split("/").filter(Boolean).pop();
  return name.split("-").map(capitalizeFirstLetter).join(" ");
};

export const flattenObject = (obj) => {
  let result = {};
  delete obj.attachments;
  for (const [key, value] of Object.entries(obj)) {
    // If the value is an object, flatten it by combining the key and its properties
    if (typeof value === "object" && value !== null) {
      const flattenedNestedObject = flattenObject(value);
      for (const [nestedKey, nestedValue] of Object.entries(
        flattenedNestedObject
      )) {
        // Combine the parent key with the nested key (just flattening)
        result[nestedKey] = nestedValue;
      }
    } else {
      // Otherwise, directly assign the key-value pair to the result
      result[key] = value;
    }
  }

  // // Fields to delete from the result
  // [
  //   "__v",
  //   "_id",
  //   "createdAt",
  //   "updatedAt",
  //   "cid",
  //   "clinic",
  //   "isBlockedByAdmin",
  //   "lastLogin",
  //   "location",
  //   "nfcTapCount",
  //   "password",
  //   "confirmPassword",
  //   "passwordChangedAt",
  //   "role",
  //   "slug",
  //   "slugId",
  //   "token",
  //   "key",
  //   "fileName",
  // ].forEach((key) => {
  //   delete result[key];
  // });

  // Define the sequence for the fields based on the given structure
  const fieldOrder = [
    "patientNo",
    "firstName",
    "lastName",
    "email",
    "medicalCondition",
    "usefulInformation",
    "organDonor",
    "bloodType",
    "gender",
    "dateOfBirth",
    "doctorName",
    "phoneNumber",
    "callingCode",
    "emergencyContact",
    "emergencyCallingCode",
    "pesel",
    "education",
    "job",
    "civilStatus",
    "familyHistoryOfDementia",
    "economicStatus",
    "height",
    "weight",
    "bmi",
    "waistCircumference",
    "bloodPressure",
    "heartRate",
    "hyperTension",
    "diabetes",
    "heartDisease",
    "liverDisease",
    "renalDisease",
    "obesity",
    "mentalIllness",
    "others",
    "medicationTaken",
    "smoking",
    "alcoholConsumption",
    "physicalExercise",
    "dietAdequacy",
    "sleepDuration",
    "cognitiveStimulation",
    "relaxationTechniques",
    "waterConsumption",
    "timeSpentAlone",
    "useOfElectronicDevice",
  ];

  // Create a new object in the required sequence
  const orderedResult = {};

  fieldOrder.forEach((field) => {
    if (result.hasOwnProperty(field)) {
      orderedResult[field] =
        typeof result[field] !== "boolean"
          ? result[field]
          : result[field]
          ? "Yes"
          : "No";
    }
    //  else {
    //   orderedResult[field] = ""; // Add empty string for missing fields
    // }
  });
  orderedResult["dateOfBirth"] = moment(
    orderedResult["dateOfBirth"] || new Date()
  ).format("YYYY-MM-DD");

  return orderedResult;
};

// export const flattenObject = (obj) => {
//   let result = {};
//   for (const [key, value] of Object.entries(obj)) {
//     // If the value is an object, flatten it by combining the key and its properties
//     if (typeof value === "object" && value !== null) {
//       const flattenedNestedObject = flattenObject(value);
//       for (const [nestedKey, nestedValue] of Object.entries(
//         flattenedNestedObject
//       )) {
//         // Combine the parent key with the nested key (just flattening)
//         result[nestedKey] = nestedValue;
//       }
//     } else {
//       // Otherwise, directly assign the key-value pair to the result
//       result[key] = value;
//     }
//   }
//   // need to delete field from results here is list
//   [
//     "__v",
//     "_id",
//     "createdAt",
//     "updatedAt",
//     "cid",
//     "clinic",
//     "isBlockedByAdmin",
//     "lastLogin",
//     "location",
//     "nfcTapCount",
//     "password",
//     "passwordChangedAt",
//     "role",
//     "slug",
//     "slugId",
//   ].forEach((key) => {
//     delete result[key];
//   });

//   return result;
// };

export const formatLabel = (label) => {
  return label
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase or PascalCase words
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
};
export const getUniqueBrowserId = () => {
  const uniqueBrowserId = localStorage?.getItem("uniqueBrowserId");
  if (uniqueBrowserId) {
    return uniqueBrowserId;
  }

  if (window.navigator) {
    var navigator_info = window.navigator;
    var screen_info = window.screen;
    var uid = navigator_info.mimeTypes.length;
    uid += navigator_info.userAgent.replace(/\D+/g, "");
    uid += navigator_info.plugins.length;
    uid += screen_info.height || "";
    uid += screen_info.width || "";
    uid += screen_info.pixelDepth || "";

    localStorage.setItem("uniqueBrowserId", uid);
    return uid;
  } else {
    const theId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    localStorage.setItem("uniqueBrowserId", theId);
    return theId;
  }
};

export const timeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};

// Format date for display
export const formatDate = (date) => {
  if (!date) return "";

  const options = { year: "numeric", month: "short", day: "2-digit" };
  return new Date(date).toLocaleDateString("en-US", options);
};

export const getMonthName = (input) => {
  // Accepts a month index (0-11), a Date instance, or a date string/ISO timestamp
  if (input === null || input === undefined) return "";

  let monthIndex;

  if (typeof input === "number") {
    monthIndex = input;
  } else {
    const date = new Date(input);
    if (isNaN(date.getTime())) return "";
    monthIndex = date.getMonth();
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return months[monthIndex] || "";
};
