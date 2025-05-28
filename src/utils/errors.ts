export const createHttpError = (status: number, message: string) => {
  const err = new Error(message) as any;
  err.status = status;
  return err;
};
