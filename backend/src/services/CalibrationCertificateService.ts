import { calibrationCertificateRepository } from "../repositories/CalibrationCertificateRepository";
import { measuringDeviceRepository } from "../repositories/MeasuringDeviceRepository";
import type { CalibrationCertificate } from "../models/CalibrationCertificate";
import type { CertificateReplacementPayload } from "../types/CalibrationCertificatePayload";
import { CertificateStatus } from "../constants/CertificateStatus";
import { DeviceCalibrationStatus } from "../constants/DeviceCalibrationStatus";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import {
  createCalibrationCertificateDto,
  createCertificateReplacementResponseDto
} from "../constructors/CalibrationCertificateDtoFactory";
import { isLaterDate, toAuditTarget } from "../utils/formatters";
import { BusinessError } from "../utils/BusinessError";

// 同一原证书的替换进行中集合：并发替换只能有一个请求完成登记
const replacementsInFlight = new Set<number>();

export const calibrationCertificateService = {
  list: () => calibrationCertificateRepository.findAll(),
  create: (row: unknown) => calibrationCertificateRepository.save(row),

  replaceCertificate: (originalCertificateId: number, payload: CertificateReplacementPayload) => {
    // 1. 并发门闩：第二个针对同一证书的请求直接冲突，不触碰任何数据
    if (replacementsInFlight.has(originalCertificateId)) {
      console.info(LOG_TEMPLATES.CalibrationCertificate[5], toAuditTarget("CalibrationCertificate", originalCertificateId), ERROR_CODES.CERTIFICATE_REPLACE_CONFLICT);
      throw new BusinessError(409, ERROR_CODES.CERTIFICATE_REPLACE_CONFLICT, ERROR_MESSAGES.CERTIFICATE_REPLACE_CONFLICT);
    }
    replacementsInFlight.add(originalCertificateId);

    try {
      // 2. 全部前置校验在任何写入之前完成，失败时原证书与设备状态不变
      const originalCertificate = calibrationCertificateRepository.findById(originalCertificateId);
      if (!originalCertificate) {
        throw new BusinessError(404, ERROR_CODES.CERTIFICATE_NOT_FOUND, ERROR_MESSAGES.CERTIFICATE_NOT_FOUND);
      }
      if (originalCertificate.status !== CertificateStatus[0]) {
        console.info(LOG_TEMPLATES.CalibrationCertificate[5], toAuditTarget("CalibrationCertificate", originalCertificateId), ERROR_CODES.CERTIFICATE_NOT_ACTIVE);
        throw new BusinessError(409, ERROR_CODES.CERTIFICATE_NOT_ACTIVE, ERROR_MESSAGES.CERTIFICATE_NOT_ACTIVE);
      }

      const requestDeviceId = payload.device_id ?? originalCertificate.device_id;
      if (Number(requestDeviceId) !== Number(originalCertificate.device_id)) {
        console.info(LOG_TEMPLATES.CalibrationCertificate[5], toAuditTarget("CalibrationCertificate", originalCertificateId), ERROR_CODES.CERTIFICATE_DEVICE_MISMATCH);
        throw new BusinessError(409, ERROR_CODES.CERTIFICATE_DEVICE_MISMATCH, ERROR_MESSAGES.CERTIFICATE_DEVICE_MISMATCH);
      }

      if (!isLaterDate(payload.valid_until, originalCertificate.valid_until)) {
        console.info(LOG_TEMPLATES.CalibrationCertificate[5], toAuditTarget("CalibrationCertificate", originalCertificateId), ERROR_CODES.CERTIFICATE_DATE_NOT_LATER);
        throw new BusinessError(409, ERROR_CODES.CERTIFICATE_DATE_NOT_LATER, ERROR_MESSAGES.CERTIFICATE_DATE_NOT_LATER);
      }

      const device = measuringDeviceRepository.findById(originalCertificate.device_id);
      if (!device) {
        throw new BusinessError(404, ERROR_CODES.DEVICE_NOT_FOUND, ERROR_MESSAGES.DEVICE_NOT_FOUND);
      }

      // 3. 登记新证书：计划沿用原证书计划，校准计划与历史证书均保留
      const replacementCertificate = calibrationCertificateRepository.insert(
        createCalibrationCertificateDto({
          id: calibrationCertificateRepository.nextId(),
          device_id: originalCertificate.device_id,
          plan_id: payload.plan_id ?? originalCertificate.plan_id,
          certificate_no: payload.certificate_no,
          result_status: payload.result_status,
          valid_until: payload.valid_until,
          file_path: payload.file_path,
          issued_by: payload.issued_by,
          status: CertificateStatus[0]
        }) as CalibrationCertificate
      );

      // 4. 原证书标记撤销（历史保留，不删除）
      calibrationCertificateRepository.update(originalCertificateId, { status: CertificateStatus[1] });
      console.info(LOG_TEMPLATES.CalibrationCertificate[6], toAuditTarget("CalibrationCertificate", originalCertificateId));

      // 5. 设备有效期采用新证书日期，状态随新有效期重算
      const nextDeviceStatus = Date.parse(payload.valid_until) > Date.now()
        ? DeviceCalibrationStatus[0]
        : DeviceCalibrationStatus[2];
      measuringDeviceRepository.update(device.id, { valid_until: payload.valid_until, status: nextDeviceStatus });
      console.info(LOG_TEMPLATES.CalibrationCertificate[7], toAuditTarget("MeasuringDevice", device.id), payload.valid_until);

      console.info(
        LOG_TEMPLATES.CalibrationCertificate[4],
        toAuditTarget("CalibrationCertificate", originalCertificateId),
        "->",
        toAuditTarget("CalibrationCertificate", replacementCertificate.id)
      );

      const updatedDevice = measuringDeviceRepository.findById(device.id);
      const revokedOriginal = calibrationCertificateRepository.findById(originalCertificateId);
      return createCertificateReplacementResponseDto(revokedOriginal, replacementCertificate, updatedDevice);
    } finally {
      replacementsInFlight.delete(originalCertificateId);
    }
  }
};
