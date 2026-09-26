import { seed } from "../seed";
import type { MeasuringDevice } from "../models/MeasuringDevice";

const rows: MeasuringDevice[] = seed.measuringDevice.map((row) => ({ ...row }));
let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const measuringDeviceRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  save: (row: Omit<MeasuringDevice, "id">) => {
    const created: MeasuringDevice = { ...row, id: nextId++ };
    rows.push(created);
    return created;
  },
  update: (id: number, patch: Partial<MeasuringDevice>) => {
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return undefined;
    rows[index] = { ...rows[index], ...patch, id };
    return rows[index];
  }
};
