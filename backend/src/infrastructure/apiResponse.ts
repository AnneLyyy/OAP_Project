export function ok(data: any, meta?: any) {
  return {
    success: true,
    data,
    meta
  };
}