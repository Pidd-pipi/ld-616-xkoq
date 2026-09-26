import type { CalibrationCertificate } from "../models/CalibrationCertificate";
import type { MeasuringDevice } from "../models/MeasuringDevice";

export const createCalibrationCertificateDto = (overrides = {}) => ({ id: 1, device_id: 1, plan_id: 1, certificate_no: "CERT-2025-0001", result_status: "PASS", valid_until: "2026-12-31", file_path: "/files/cert-2025-0001.pdf", issued_by: "issued by 1", status: "ACTIVE", ...overrides });

export const createCertificateReplaceResultDto = (oldCertificate: CalibrationCertificate | undefined, newCertificate: CalibrationCertificate, device: MeasuringDevice | undefined) => ({ old_certificate: oldCertificate, new_certificate: newCertificate, device });
