import { serverTimestamp, Timestamp } from "firebase/firestore";
import { z } from "zod";

//
export const removeKey = <T extends object, K extends keyof T>(key: K, object: T): Omit<T, K> => {
  const { [key]: _, ...rest } = object;
  return rest;
};

export type TServerTimestamp = ReturnType<typeof serverTimestamp>;
export type TTimestamp = ReturnType<typeof Timestamp.now>;
export type TTimestampValue = Pick<TTimestamp, "seconds" | "nanoseconds">;

export const getNotNowTimestamp = () => {
  const now = Timestamp.now();
  return { ...now, nanoseconds: now.nanoseconds - 1 };
};

export const getTimestampFromTimestampValue = (x: TTimestampValue) => {
  return new Timestamp(x.seconds, x.nanoseconds);
};

export const timestampSchema = z
  .object({ seconds: z.number(), nanoseconds: z.number() })
  .transform((x) => getTimestampFromTimestampValue(x));

export const creatifyDoc = <T extends object>(obj: T) => {
  return { ...obj, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
};

export const updatifyDoc = <T extends { createdAt: TTimestampValue }>(
  object: T,
): T & { createdAt: TTimestamp; updatedAt: TServerTimestamp } => {
  return {
    ...object,
    createdAt: getTimestampFromTimestampValue(object.createdAt),
    updatedAt: serverTimestamp(),
  };
};
