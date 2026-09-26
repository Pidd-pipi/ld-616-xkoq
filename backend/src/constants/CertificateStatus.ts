export const CertificateStatus = ["ACTIVE", "REVOKED"] as const;
export type CertificateStatus = (typeof CertificateStatus)[number];
export const CERTIFICATE_STATUS_ACTIVE: CertificateStatus = "ACTIVE";
export const CERTIFICATE_STATUS_REVOKED: CertificateStatus = "REVOKED";
