export interface CalibrationCertificatePayload {
  device_id?: number;
  plan_id?: number;
  certificate_no: string;
  result_status: string;
  valid_until: string;
  file_path: string;
  issued_by: string;
  [key: string]: unknown;
}

export interface CertificateReplacementPayload {
  device_id?: number;
  plan_id?: number;
  certificate_no: string;
  result_status: string;
  valid_until: string;
  file_path: string;
  issued_by: string;
}
