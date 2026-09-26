import { CertificateResult } from "../constants/CertificateResult";
import { apiError } from "../utils/apiError";
import type { ReplaceCertificatePayload } from "../types/CalibrationCertificatePayload";

const REQUIRED_FIELDS: (keyof ReplaceCertificatePayload)[] = ["device_id", "certificate_no", "result_status", "valid_until", "file_path", "issued_by"];

export const validateCertificateReplacePayload = (payload: Partial<ReplaceCertificatePayload>): void => {
  const missing = REQUIRED_FIELDS.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");
  if (missing.length > 0) throw apiError(400, "VALIDATION_FAILED");
  if (!(CertificateResult as readonly string[]).includes(String(payload.result_status))) throw apiError(400, "VALIDATION_FAILED");
  if (Number.isNaN(Date.parse(String(payload.valid_until)))) throw apiError(400, "VALIDATION_FAILED");
};
