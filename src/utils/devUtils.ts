export const success = <T extends object>(p: { data: T }) => {
  return { success: true, data: p.data } as const;
};
export const fail = <T extends { message: string }>(p: { error: T }) => {
  return { success: false, error: p.error } as const;
};
