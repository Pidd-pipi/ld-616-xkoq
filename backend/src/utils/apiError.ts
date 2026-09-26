import { ERROR_MESSAGES } from "../constants/errorMessages";

export type ApiError = Error & { status: number; code: keyof typeof ERROR_MESSAGES };

export const apiError = (status: number, code: keyof typeof ERROR_MESSAGES): ApiError => {
  const err = new Error(ERROR_MESSAGES[code]) as ApiError;
  err.status = status;
  err.code = code;
  return err;
};
