import { seed } from "../seed";
import type { MeasuringDevice } from "../models/MeasuringDevice";

const rows: MeasuringDevice[] = seed.measuringDevice.map((row) => ({ ...row }));

export const measuringDeviceRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  save: (row: unknown) => row,
  update: (id: number, patch: Partial<MeasuringDevice>) => {
    const row = rows.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
