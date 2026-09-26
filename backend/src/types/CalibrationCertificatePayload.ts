export type CalibrationCertificatePayload = Record<string, unknown>;

export interface ReplaceCertificatePayload {
  device_id: number;
  plan_id?: number;
  certificate_no: string;
  result_status: string;
  valid_until: string;
  file_path: string;
  issued_by: string;
}
