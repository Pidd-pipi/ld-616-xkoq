import { CertificateResult } from "../constants/CertificateResult";
import { CertificateStatus } from "../constants/CertificateStatus";

export const createCalibrationCertificateDto = (overrides = {}) => ({ id: 1, device_id: 1, plan_id: 1, certificate_no: "certificate no 1", result_status: CertificateResult[0], valid_until: "2027-03-01T00:00:00Z", file_path: "file path 1", issued_by: "issued by 1", status: CertificateStatus[0], ...overrides });

export const createCertificateReplacementRequestDto = (overrides = {}) => ({ certificate_no: "", result_status: CertificateResult[0], valid_until: "", file_path: "", issued_by: "", ...overrides });
export const createCertificateReplacementResponseDto = (originalCertificate: unknown, replacementCertificate: unknown, device: unknown) => ({ original_certificate: originalCertificate, replacement_certificate: replacementCertificate, device });
