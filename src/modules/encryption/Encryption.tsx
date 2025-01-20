import { auth, db, storage } from "@/config/firebaseConfig";
import { balancesSdk } from "@/db/firestoreBalancesSdk";
import { createFileAndUpdateBalance } from "@/db/firestoreFilesAndBalancesSdk";
import { convertArrayBufferToBlob } from "@/utils/dataTypeUtils";
import { useRef, useState } from "react";
import { useNotifyStore } from "../notify";
import { encryptFile, serializeUInt8Array } from "./utils";
import { uploadFileBlob } from "@/db/firebaseStorageSdkUtils";
import { $ } from "@/utils/useReactive";

export const Encryption = (p: {
  password: string;
  salt: Uint8Array;
  initializationVector: Uint8Array;
}) => {
  const notifyStore = useNotifyStore();

  const fileUploadElementRef = useRef<HTMLInputElement>(null);
  const [unencryptedFileBuffer, setUnencryptedFileBuffer] = useState<ArrayBuffer>();
  const [encryptedFileBuffer, setEncryptedFileBuffer] = useState<ArrayBuffer>();
  const $isUploadEncrytedFileLoading = $(false);

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
            if ($isUploadEncrytedFileLoading.value) return;

            $isUploadEncrytedFileLoading.set(true);
            const response = await (async () => {
              if (!encryptedFileBuffer)
                return { success: false, error: { message: "encrypted file not found" } } as const;

              const uid = auth.currentUser?.uid;
              if (!uid)
                return { success: false, error: { message: "user not logged in" } } as const;

              const balancesResponse = await balancesSdk.getDoc({ db, id: uid });
              if (!balancesResponse.success)
                return {
                  success: false,
                  error: { message: "could not retrieve balance" },
                } as const;
              const balance = balancesResponse.data;
              if (balance.numberOfCoupons <= 0)
                return { success: false, error: { message: "insufficient balance" } } as const;

              const response = await createFileAndUpdateBalance({
                db,
                balance,
                file: {
                  name: fileName,
                  serializedEncryptionKeySalt: serializeUInt8Array(p.salt),
                  serializedInitializationVector: serializeUInt8Array(p.initializationVector),
                },
              });
              if (!response.success)
                return {
                  success: false,
                  error: { message: "unable to create file and update balance" } as const,
                };
              const blob = convertArrayBufferToBlob(encryptedFileBuffer);

              const snapshot = await uploadFileBlob({ storage, id: response.data.file.id, blob });
              if (snapshot.success) return { success: true } as const;
              return { success: false, error: { message: "file upload failed" } } as const;
            })();
            $isUploadEncrytedFileLoading.set(false);

            notifyStore.push(
              response.success
                ? { type: "alert-success", children: "file uploaded successfully" }
                : {
                    type: "alert-warning",
                    children: (
                      <>
                        <div>Could not upload file</div>
                        <div>{response.error.message}</div>
                      </>
                    ),
                  },
            );
          }}
        >
          {!$isUploadEncrytedFileLoading.value && <div>^ Upload Encrypted File</div>}
          {$isUploadEncrytedFileLoading.value && (
            <span className="loading loading-spinner loading-sm" />
          )}
        </button>
      </span>
    </span>
  );
};
