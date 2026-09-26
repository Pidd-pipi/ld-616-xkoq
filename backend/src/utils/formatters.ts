import { CertificateStatus } from "../constants/CertificateStatus";

export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;

export const formatCertificateStatus = (status: string) => {
  switch (status) {
    case CertificateStatus[0]:
      return "有效";
    case CertificateStatus[1]:
      return "已撤销";
    default:
      return status;
  }
};

export const isLaterDate = (candidate: string, baseline: string) => Date.parse(candidate) > Date.parse(baseline);
