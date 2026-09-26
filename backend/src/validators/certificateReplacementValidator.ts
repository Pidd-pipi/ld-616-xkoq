import { CertificateResult } from "../constants/CertificateResult";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { BusinessError } from "../utils/BusinessError";
import { createCertificateReplacementRequestDto } from "../constructors/CalibrationCertificateDtoFactory";
import type { CertificateReplacementPayload } from "../types/CalibrationCertificatePayload";

export const validateCertificateReplacementPayload = (body: Record<string, unknown>): CertificateReplacementPayload => {
  const payload = createCertificateReplacementRequestDto(body) as CertificateReplacementPayload & Record<string, unknown>;

  if (typeof payload.certificate_no !== "string" || payload.certificate_no.trim() === "") {
    throw new BusinessError(400, ERROR_CODES.VALIDATION_FAILED, `${ERROR_MESSAGES.VALIDATION_FAILED}: certificate_no required`);
  }
  if (typeof payload.valid_until !== "string" || Number.isNaN(Date.parse(payload.valid_until))) {
    throw new BusinessError(400, ERROR_CODES.VALIDATION_FAILED, `${ERROR_MESSAGES.VALIDATION_FAILED}: valid_until must be an ISO date`);
  }
  if (typeof payload.result_status !== "string" || !CertificateResult.includes(payload.result_status as (typeof CertificateResult)[number])) {
    throw new BusinessError(400, ERROR_CODES.VALIDATION_FAILED, `${ERROR_MESSAGES.VALIDATION_FAILED}: result_status must be one of ${CertificateResult.join("/")}`);
  }
  if (payload.file_path !== undefined && typeof payload.file_path !== "string") {
    throw new BusinessError(400, ERROR_CODES.VALIDATION_FAILED, `${ERROR_MESSAGES.VALIDATION_FAILED}: file_path must be a string`);
  }
  if (payload.issued_by !== undefined && typeof payload.issued_by !== "string") {
    throw new BusinessError(400, ERROR_CODES.VALIDATION_FAILED, `${ERROR_MESSAGES.VALIDATION_FAILED}: issued_by must be a string`);
  }
  if (payload.device_id !== undefined && payload.device_id !== null && Number.isNaN(Number(payload.device_id))) {
    throw new BusinessError(400, ERROR_CODES.VALIDATION_FAILED, `${ERROR_MESSAGES.VALIDATION_FAILED}: device_id must be a number`);
  }
  if (payload.plan_id !== undefined && payload.plan_id !== null && Number.isNaN(Number(payload.plan_id))) {
    throw new BusinessError(400, ERROR_CODES.VALIDATION_FAILED, `${ERROR_MESSAGES.VALIDATION_FAILED}: plan_id must be a number`);
  }

  return {
    certificate_no: payload.certificate_no,
    result_status: payload.result_status,
    valid_until: payload.valid_until,
    file_path: payload.file_path ?? "",
    issued_by: payload.issued_by ?? "",
    device_id: payload.device_id === undefined || payload.device_id === null ? undefined : Number(payload.device_id),
    plan_id: payload.plan_id === undefined || payload.plan_id === null ? undefined : Number(payload.plan_id)
  };
};
