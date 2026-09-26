import { Router } from "express";
import { calibrationCertificateController } from "../controllers/CalibrationCertificateController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", calibrationCertificateController.list);
router.post("/", calibrationCertificateController.create);
router.post("/:id/replace", rbacMiddleware(["admin", "quality_manager", "calibrator"]), calibrationCertificateController.replace);

export default router;
