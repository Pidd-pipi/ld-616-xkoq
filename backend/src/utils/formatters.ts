export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;
export const isDateAfter = (later: string, earlier: string) => Date.parse(later) > Date.parse(earlier);
