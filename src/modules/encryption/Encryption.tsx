import { auth, db, storage } from "@/config/firebaseConfig";
import { balancesSdk } from "@/db/firestoreBalancesSdk";
import { createFileAndUpdateBalance } from "@/db/firestoreFilesAndBalancesSdk";
import { convertArrayBufferToBlob } from "@/utils/dataTypeUtils";
import { useRef, useState } from "react";
import { useNotifyStore } from "../notify";
import { encryptFile, serializeUInt8Array } from "./utils";
import { uploadFileBlob } from "@/db/firebaseStorageSdkUtils";

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
            if (!encryptedFileBuffer) return;

            const uid = auth.currentUser?.uid;
            if (!uid) return;

            const balancesResponse = await balancesSdk.getDoc({ db, id: uid });
            if (!balancesResponse.success) return;
            const balance = balancesResponse.data;

            const response = await createFileAndUpdateBalance({
              db,
              balance,
              file: { name: fileName, serializedEncryptionKeySalt: serializeUInt8Array(p.salt) },
            });
            if (!response.success) return;
            const blob = convertArrayBufferToBlob(encryptedFileBuffer);

            const snapshot = await uploadFileBlob({ storage, id: response.data.file.id, blob });
            if (snapshot.success)
              return notifyStore.push(
                snapshot.success
                  ? { type: "alert-success", children: "file uploaded successfully" }
                  : { type: "alert-warning", children: "file upload failed" },
              );
          }}
        >
          ^ Upload Encrypted File
        </button>
      </span>
    </span>
  );
};
