import { seed } from "../seed";
import type { CalibrationCertificate } from "../models/CalibrationCertificate";

const rows: CalibrationCertificate[] = seed.calibrationCertificate.map((row) => ({ ...row }));

export const calibrationCertificateRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  save: (row: unknown) => row,
  insert: (row: CalibrationCertificate) => {
    rows.push(row);
    return row;
  },
  update: (id: number, patch: Partial<CalibrationCertificate>) => {
    const row = rows.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  },
  nextId: () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1
};
