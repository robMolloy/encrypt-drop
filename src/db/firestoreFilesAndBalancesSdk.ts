import { TDb } from "@/utils/firestoreSdkUtils/firestoreSdkUtils";
import { z } from "zod";
import { fileSchema, filesSdk, getNextFileId } from "./firestoreFilesSdk";
import { balanceSchema, balancesSdk } from "./firestoreBalancesSdk";
import { creatifyDoc, updatifyDoc } from "@/utils/firestoreSdkUtils/firestoreUtils";
import { fail, success } from "@/utils/devUtils";

export const createFileAndUpdateBalance = async (p: {
  db: TDb;
  file: Pick<
    z.infer<typeof fileSchema>,
    | "fileName"
    | "encryptedFileName"
    | "serializedEncryptionKeySalt"
    | "serializedInitializationVector"
  >;
  balance: z.infer<typeof balanceSchema>;
}) => {
  const fileId = getNextFileId({ balance: p.balance });
  const createFileResponse = await filesSdk.setDoc({
    db: p.db,
    data: creatifyDoc({ id: fileId, uid: p.balance.uid, ...p.file }),
  });
  if (!createFileResponse.success) return fail({ error: { message: "create file failed" } });

  const getFileResponse = await filesSdk.getDoc({ db: p.db, id: fileId });
  if (!getFileResponse.success) return fail({ error: { message: "get file failed" } });

  const updateBalanceResponse = await balancesSdk.updateDoc({
    db: p.db,
    data: updatifyDoc({ ...p.balance, numberOfCoupons: p.balance.numberOfCoupons - 1 }),
  });
  if (!updateBalanceResponse.success) return fail({ error: { message: "update balance failed" } });

  const getBalanceResponse = await balancesSdk.getDoc({ db: p.db, id: p.balance.uid });
  if (!getBalanceResponse.success) return fail({ error: { message: "getUpdatedBalance failed" } });

  return success({ data: { file: getFileResponse.data, balance: getBalanceResponse.data } });
};
