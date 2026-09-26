import type { NextFunction, Request, Response } from "express";
import { calibrationCertificateService } from "../services/CalibrationCertificateService";
import { LOG_TEMPLATES } from "../constants/logTemplates";

export const calibrationCertificateController = {
  list: (_req: Request, res: Response) => res.json(calibrationCertificateService.list()),
  create: (req: Request, res: Response) => res.status(201).json(calibrationCertificateService.create(req.body)),
  replace: (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = calibrationCertificateService.replace(Number(req.params.id), req.body);
      res.status(201).json(result);
    } catch (err) {
      const wrapped = err as { status?: number; code?: string; message?: string };
      if (!wrapped.code) {
        console.error(LOG_TEMPLATES.CalibrationCertificate[4], wrapped.message);
        next(Object.assign(new Error("certificate replace failed"), { status: 500, code: "INTERNAL_ERROR" }));
        return;
      }
      next(wrapped);
    }
  }
};
