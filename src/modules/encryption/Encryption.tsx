import { db, storage } from "@/config/firebaseConfig";
import { uploadFileBlob } from "@/db/firebaseStorageSdkUtils";
import { balancesSdk } from "@/db/firestoreBalancesSdk";
import { createFileAndUpdateBalance } from "@/db/firestoreFilesAndBalancesSdk";
import { convertArrayBufferToBlob } from "@/utils/dataTypeUtils";
import { $, useReactive } from "@/utils/useReactive";
import { CloudArrowUpIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import { useNotifyStore } from "../notify";
import { Keys } from "./Keys";
// import { encryptFile } from "./utils";

// const success = <T extends object>(p?: { data: T }) => {
//   return { success: true, data: p?.data } as const;
// };
// const fail = <T extends { message?: string }>(p?: { error: T }) => {
//   return { success: false, error: p?.error } as const;
// };

export const Encryption = (p: { uid: string | undefined }) => {
  const notifyStore = useNotifyStore();

  const $password = useReactive("");
  const $serializedEncryptionKeySalt = useReactive("");
  const $serializedInitializationVector = useReactive("");
  const fileUploadElementRef = useRef<HTMLInputElement>(null);
  const [unencryptedFileBuffer, setUnencryptedFileBuffer] = useState<ArrayBuffer>();
  const [encryptedFileBuffer, setEncryptedFileBuffer] = useState<ArrayBuffer>();
  const $isUploadEncrytedFileLoading = $(false);

  const step = (() => {
    if (!unencryptedFileBuffer) return "add-file";
    if (!encryptedFileBuffer) return "encrypt-file";
    return "download-file";
  })();

  const $fileName = $("");
  const $encryptedFileName = $("");

  return (
    <span className="flex flex-col gap-4">
      <span className="flex gap-2">
        <input
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
            $fileName.set(file.name);
            $encryptedFileName.set(`${file.name}.bin`);
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
            $fileName.set("");
            $encryptedFileName.set("");
          }}
          className="btn btn-outline"
        >
          X
        </button>
      </span>

      <label className="form-control w-full">
        <div className={`label ${step === "add-file" ? "opacity-10" : ""}`}>
          <span className="label-text">Password</span>
        </div>
        <input
          type="password"
          disabled={step === "add-file"}
          value={step === "add-file" ? "" : $password.value}
          onChange={(e) => $password.set(e.target.value)}
          className="input input-bordered w-full"
        />
      </label>

      <label className="form-control w-full">
        <div className={`label ${step === "add-file" ? "opacity-10" : ""}`}>
          <span className="label-text">File name and extension (only required if uploading)</span>
        </div>
        <input
          type="text"
          disabled={step === "add-file"}
          value={step === "add-file" ? "" : $fileName.value}
          onChange={(e) => $fileName.set(e.target.value)}
          className="input input-bordered w-full"
        />
      </label>
      <label className="form-control w-full">
        <div className={`label ${step === "add-file" ? "opacity-10" : ""}`}>
          <span className="label-text">Encrypted file name and extension</span>
        </div>
        <input
          type="text"
          disabled={step === "add-file"}
          value={step === "add-file" ? "" : $encryptedFileName.value}
          onChange={(e) => $encryptedFileName.set(e.target.value)}
          className="input input-bordered w-full"
        />
      </label>

      <span className="flex gap-2">
        <a
          type="button"
          className={`btn flex-1 ${step === "add-file" ? "btn-disabled" : "btn-primary"}`}
          href={
            encryptedFileBuffer
              ? URL.createObjectURL(convertArrayBufferToBlob(encryptedFileBuffer))
              : "#"
          }
          download={step === "download-file" ? $encryptedFileName.value : true}
        >
          <DocumentArrowDownIcon className="size-6" /> Download Encrypted File
        </a>
        {!p.uid && (
          <>
            <div className="tooltip flex-1" data-tip="You must be logged in to upload a file">
              <button
                className="btn btn-info w-full cursor-not-allowed"
                disabled={step === "add-file"}
              >
                <CloudArrowUpIcon className="size-6" /> Upload Encrypted File
              </button>
            </div>
          </>
        )}

        {p.uid && (
          <button
            disabled={step === "add-file" || !p.uid}
            className="btn btn-primary flex-1"
            onClick={async () => {
              if ($isUploadEncrytedFileLoading.value) return;

              $isUploadEncrytedFileLoading.set(true);
              const response = await (async () => {
                if (!encryptedFileBuffer)
                  return {
                    success: false,
                    error: { message: "encrypted file not found" },
                  } as const;

                if (!p.uid)
                  return { success: false, error: { message: "user not logged in" } } as const;

                const balancesResponse = await balancesSdk.getDoc({ db, id: p.uid });
                if (!balancesResponse.success)
                  return {
                    success: false,
                    error: { message: "could not retrieve balance" },
                  } as const;
                const balance = balancesResponse.data;
                if (balance.numberOfCoupons <= 0)
                  return { success: false, error: { message: "insufficient balance" } } as const;

                if (!$serializedEncryptionKeySalt.value) return { success: false } as const;
                if (!$serializedInitializationVector.value) return { success: false } as const;

                const response = await createFileAndUpdateBalance({
                  db,
                  balance,
                  file: {
                    fileName: $fileName.value,
                    encryptedFileName: $encryptedFileName.value,
                    serializedEncryptionKeySalt: $serializedEncryptionKeySalt.value,
                    serializedInitializationVector: $serializedInitializationVector.value,
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
                          <div>{response.error?.message}</div>
                        </>
                      ),
                    },
              );
            }}
          >
            {!$isUploadEncrytedFileLoading.value && (
              <>
                <CloudArrowUpIcon className="size-6" /> Upload Encrypted File
              </>
            )}
            {$isUploadEncrytedFileLoading.value && (
              <span className="loading loading-spinner loading-sm" />
            )}
          </button>
        )}
      </span>
      <Keys
        generateNewKeysOnMount={true}
        serialisedEncryptionKeySalt={$serializedEncryptionKeySalt.value}
        serialisedInitializationVector={$serializedInitializationVector.value}
        onSerialisedEncryptionKeySaltChange={(x) => $serializedEncryptionKeySalt.set(x)}
        onSerialisedInitializationVectorChange={(x) => $serializedInitializationVector.set(x)}
      />
    </span>
  );
};
