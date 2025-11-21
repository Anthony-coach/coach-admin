export const RECORDS_LIMIT = 10;
export const FORM_REG_EX = /([a-z])([A-Z])/g;
export const FORM_REG_EX_REPLACER = "$1 $2";

export const NUMBER_REG_EX = /[^0-9]+/g;
export const DECIMAL_REG_EX = /^\d+(\.\d{0,2})?$/;





export const URL_REG_EX = /^(http|https):\/\/[^ "]+$/;
export const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
export const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{10}$/;
export const excludedFields = [
  "slug",
  "slugId",
  "token",
  "key",
  "fileName",
  "updatedAt",
  "createdAt",
  "__v",
  "_id",
  "isBlockedByAdmin",
  "lastLogin",
  "password",
  "confirmPassword",
];







