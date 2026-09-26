import { seed } from "../seed";
import type { CalibrationCertificate } from "../models/CalibrationCertificate";

const rows: CalibrationCertificate[] = seed.calibrationCertificate.map((row) => ({ ...row }));
let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const calibrationCertificateRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  save: (row: Omit<CalibrationCertificate, "id">) => {
    const created: CalibrationCertificate = { ...row, id: nextId++ };
    rows.push(created);
    return created;
  },
  update: (id: number, patch: Partial<CalibrationCertificate>) => {
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return undefined;
    rows[index] = { ...rows[index], ...patch, id };
    return rows[index];
  }
};
