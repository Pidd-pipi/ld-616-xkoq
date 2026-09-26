import type { Request, Response, NextFunction } from "express";
import { calibrationCertificateService } from "../services/CalibrationCertificateService";
import { validateCertificateReplacementPayload } from "../validators/certificateReplacementValidator";
import { BusinessError } from "../utils/BusinessError";
import { ERROR_CODES } from "../constants/errorCodes";

const parseCertificateId = (value: string) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BusinessError(400, ERROR_CODES.VALIDATION_FAILED, `invalid certificate id: ${value}`);
  }
  return id;
};

export const calibrationCertificateController = {
  list: (_req: Request, res: Response) => res.json(calibrationCertificateService.list()),

  create: (req: Request, res: Response) => res.status(201).json(calibrationCertificateService.create(req.body)),

  replace: (req: Request, res: Response, next: NextFunction) => {
    try {
      const originalCertificateId = parseCertificateId(req.params.id);
      const payload = validateCertificateReplacementPayload(req.body ?? {});
      const result = calibrationCertificateService.replaceCertificate(originalCertificateId, payload);
      return res.status(201).json(result);
    } catch (error) {
      // controller 层二次包装：service 抛出的业务异常原样转交，其余异常统一标记
      if (error instanceof BusinessError) {
        return next(error);
      }
      return next(new BusinessError(500, ERROR_CODES.VALIDATION_FAILED, (error as Error).message));
    }
  }
};
