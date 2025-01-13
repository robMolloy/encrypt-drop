import { auth, db } from "@/config/firebaseConfig";
import { balancesSdk } from "@/db/firestoreBalancesSdk";
import { filesSdk, getNextFileId } from "@/db/firestoreFilesSdk";
import { creatifyDoc, updatifyDoc } from "@/utils/firestoreSdkUtils/firestoreUtils";
import { useRef, useState } from "react";
import { useNotifyStore } from "../notify";
import { encryptFile, serializeUInt8Array } from "./utils";

export const Encryption = (p: {
  password: string;
  salt: Uint8Array;
  initializationVector: Uint8Array;
}) => {
  const notifyStore = useNotifyStore();

  const fileUploadElementRef = useRef<HTMLInputElement>(null);
  const [unencryptedFileBuffer, setUnencryptedFileBuffer] = useState<ArrayBuffer>();
  const [encryptedFileBuffer, setEncryptedFileBuffer] = useState<ArrayBuffer>();

  const step = (() => {
    if (!unencryptedFileBuffer) return "add-file";
    if (!encryptedFileBuffer) return "encrypt-file";
    return "download-file";
  })();

  const fileName = fileUploadElementRef.current?.files?.[0]?.name
    ? `${fileUploadElementRef.current?.files?.[0].name}.bin`
    : "encryptedFile.bin";

  return (
    <span className="flex flex-col gap-4">
      <span className="flex gap-2">
        <input
          disabled={step !== "add-file"}
          ref={fileUploadElementRef}
          type="file"
          className="file-input w-full cursor-pointer"
          onInput={async () => {
            const fileInput = fileUploadElementRef.current;
            if (!fileInput) return { success: false } as const;

            const file = fileInput.files?.[0];
            if (!file) return { success: false } as const;

            const fileBuffer = await file.arrayBuffer();
            setUnencryptedFileBuffer(fileBuffer);
          }}
        />
        <button
          disabled={step === "add-file"}
          onClick={() => {
            const fileInput = fileUploadElementRef.current;
            if (!fileInput) return { success: false } as const;

            fileInput.value = "";
            setUnencryptedFileBuffer(undefined);
            setEncryptedFileBuffer(undefined);
          }}
          className="btn btn-outline"
        >
          X
        </button>
      </span>

      <button
        disabled={step !== "encrypt-file"}
        type="button"
        className="btn btn-primary"
        onClick={async () => {
          if (!unencryptedFileBuffer) return;

          const response = await encryptFile({
            initializationVector: p.initializationVector,
            password: p.password,
            salt: p.salt,
            unencryptedFileBuffer,
          });

          if (response.success) return setEncryptedFileBuffer(response.data);
          notifyStore.push({
            type: "alert-warning",
            children: response.error.message ? response.error.message : "Unable to encrypt",
          });
        }}
      >
        Encrypt File
      </button>

      <span className="flex gap-2">
        <a
          type="button"
          className={`btn flex-1 ${step === "download-file" ? "btn-primary" : "btn-disabled"}`}
          href={
            encryptedFileBuffer
              ? URL.createObjectURL(
                  new Blob([encryptedFileBuffer], { type: "application/octet-stream" }),
                )
              : "#"
          }
          download={
            fileUploadElementRef.current?.files?.[0]?.name
              ? `${fileUploadElementRef.current?.files?.[0].name}.bin`
              : "encryptedFile.bin"
          }
        >
          \/ Download Encrypted File
        </a>
        <button
          disabled={step !== "download-file"}
          className="btn btn-primary flex-1"
          onClick={async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            const balancesResponse = await balancesSdk.getDoc({ db, id: uid });
            if (!balancesResponse.success) return;

            const balance = balancesResponse.data;
            await filesSdk.setDoc({
              db,
              data: creatifyDoc({
                id: getNextFileId({ balance }),
                name: fileName,
                uid: uid,
                serializedEncryptionKeySalt: serializeUInt8Array(p.salt),
              }),
            });

            await balancesSdk.updateDoc({
              db,
              data: updatifyDoc({ ...balance, numberOfCoupons: balance.numberOfCoupons - 1 }),
            });
          }}
        >
          ^ Upload Encrypted File
        </button>
      </span>
    </span>
  );
};
