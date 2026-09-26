export const CertificateStatus = ["ACTIVE", "REVOKED"] as const;
export type CertificateStatus = (typeof CertificateStatus)[number];
