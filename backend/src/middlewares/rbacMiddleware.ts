import type { RequestHandler } from "express";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { BusinessError } from "../utils/BusinessError";

export const rbacMiddleware = (roles: string[] = []): RequestHandler => (req, _res, next) => {
  if (roles.length === 0) {
    return next();
  }
  const role = (req as unknown as { user?: { role?: string } }).user?.role;
  if (!role || !roles.includes(role)) {
    return next(new BusinessError(403, ERROR_CODES.RBAC_DENIED, ERROR_MESSAGES.RBAC_DENIED));
  }
  return next();
};
