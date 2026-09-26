import { calibrationCertificateRepository } from "../repositories/CalibrationCertificateRepository";
import { measuringDeviceRepository } from "../repositories/MeasuringDeviceRepository";
import { CERTIFICATE_STATUS_ACTIVE, CERTIFICATE_STATUS_REVOKED } from "../constants/CertificateStatus";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { apiError } from "../utils/apiError";
import { isDateAfter, toAuditTarget } from "../utils/formatters";
import { validateCertificateReplacePayload } from "../validators/certificateReplaceValidator";
import { createCertificateReplaceResultDto } from "../constructors/CalibrationCertificateDtoFactory";
import type { CalibrationCertificate } from "../models/CalibrationCertificate";
import type { ReplaceCertificatePayload } from "../types/CalibrationCertificatePayload";

const replaceLocks = new Set<number>();

export const calibrationCertificateService = {
  list: () => calibrationCertificateRepository.findAll(),
  create: (row: Omit<CalibrationCertificate, "id">) => calibrationCertificateRepository.save(row),
  replace: (oldCertificateId: number, payload: ReplaceCertificatePayload) => {
    if (replaceLocks.has(oldCertificateId)) throw apiError(409, "CERT_REPLACE_CONFLICT");
    replaceLocks.add(oldCertificateId);
    try {
      const oldCertificate = calibrationCertificateRepository.findById(oldCertificateId);
      if (!oldCertificate) throw apiError(404, "CERT_NOT_FOUND");
      if (oldCertificate.status !== CERTIFICATE_STATUS_ACTIVE) throw apiError(409, "CERT_NOT_REPLACEABLE");
      validateCertificateReplacePayload(payload);
      if (Number(payload.device_id) !== oldCertificate.device_id) throw apiError(400, "CERT_DEVICE_MISMATCH");
      if (!isDateAfter(String(payload.valid_until), oldCertificate.valid_until)) throw apiError(400, "CERT_VALID_UNTIL_NOT_LATER");
      const device = measuringDeviceRepository.findById(oldCertificate.device_id);
      if (!device) throw apiError(404, "DEVICE_NOT_FOUND");
      const revokedOldCertificate = calibrationCertificateRepository.update(oldCertificate.id, { status: CERTIFICATE_STATUS_REVOKED });
      const newCertificate = calibrationCertificateRepository.save({
        device_id: oldCertificate.device_id,
        plan_id: payload.plan_id ?? oldCertificate.plan_id,
        certificate_no: payload.certificate_no,
        result_status: payload.result_status,
        valid_until: payload.valid_until,
        file_path: payload.file_path,
        issued_by: payload.issued_by,
        status: CERTIFICATE_STATUS_ACTIVE
      });
      const updatedDevice = measuringDeviceRepository.update(device.id, { valid_until: payload.valid_until, status: "VALID" });
      console.info(LOG_TEMPLATES.CalibrationCertificate[5], toAuditTarget("CalibrationCertificate", oldCertificate.id));
      console.info(LOG_TEMPLATES.CalibrationCertificate[4], toAuditTarget("CalibrationCertificate", newCertificate.id));
      return createCertificateReplaceResultDto(revokedOldCertificate, newCertificate, updatedDevice);
    } finally {
      replaceLocks.delete(oldCertificateId);
    }
  }
};
