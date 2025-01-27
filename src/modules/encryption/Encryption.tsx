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
import { encryptFile } from "./utils";
import { downloadFile } from "@/utils/fileUtils";
import { fail, success } from "@/utils/devUtils";
// import { encryptFile } from "./utils";

export const Encryption = (p: { uid: string | undefined }) => {
  const notifyStore = useNotifyStore();

  const $password = useReactive("");
  const $serializedEncryptionKeySalt = useReactive("");
  const $serializedInitializationVector = useReactive("");
  const fileUploadElementRef = useRef<HTMLInputElement>(null);
  const [unencryptedFileBuffer, setUnencryptedFileBuffer] = useState<ArrayBuffer>();
  const $isUploading = $(false);
  const $isDownloading = $(false);

  const step = (() => {
    if (!unencryptedFileBuffer) return "add-file";
    return "download-file";
  })();

  const $fileName = $("");
  const $encryptedFileName = $("");

  const resetForm = () => {
    setUnencryptedFileBuffer(undefined);
    $fileName.set("");
    $encryptedFileName.set("");

    if (fileUploadElementRef.current) fileUploadElementRef.current.value = "";
  };

  const getFileFromInput = () => {
    const fileInput = fileUploadElementRef.current;
    if (!fileInput) return fail({ error: { message: "No file input element found" } });

    const file = fileInput.files?.[0];
    if (!file) return fail({ error: { message: "No file selected" } });
    return success({ data: file });
  };

  return (
    <span className="flex flex-col gap-4">
      <span className="flex gap-2">
        <input
          ref={fileUploadElementRef}
          type="file"
          className="file-input w-full cursor-pointer"
          onInput={async () => {
            const getFileDataResponse = getFileFromInput();

            if (!getFileDataResponse.success) return resetForm();

            const file = getFileDataResponse.data;
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
          placeholder="Type a password..."
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
        <button
          className="btn btn-primary flex-1"
          disabled={step === "add-file" || $isDownloading.value}
          onClick={async () => {
            if ($isDownloading.value) return;

            $isDownloading.set(true);

            const encryptFileResponse = await (() => {
              if (!unencryptedFileBuffer) return fail({ error: { message: "No file selected" } });

              return encryptFile({
                password: $password.value,
                serializedInitializationVector: $serializedInitializationVector.value,
                serializedEncryptionKeySalt: $serializedEncryptionKeySalt.value,
                unencryptedFileBuffer: unencryptedFileBuffer,
              });
            })();

            $isDownloading.set(false);

            if (!encryptFileResponse.success)
              return notifyStore.push({
                heading: "Could not encrypt file",
              });

            downloadFile({
              fileName: $encryptedFileName.value,
              fileBuffer: encryptFileResponse.data,
            });
          }}
        >
          <DocumentArrowDownIcon className="size-6" />{" "}
          {$isDownloading.value ? "Downloading..." : "Encrypt & Download"}
        </button>
        {!p.uid && (
          <div className="tooltip flex-1" data-tip="You must be logged in to upload a file">
            <button
              className="btn btn-info w-full cursor-not-allowed"
              disabled={step === "add-file"}
            >
              <CloudArrowUpIcon className="size-6" /> Upload Encrypted File
            </button>
          </div>
        )}

        {p.uid && (
          <button
            disabled={step === "add-file" || !p.uid}
            className="btn btn-primary flex-1"
            onClick={async () => {
              if ($isUploading.value) return;

              $isUploading.set(true);
              const response = await (async () => {
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
                if (!unencryptedFileBuffer) return { success: false } as const;

                const encryptFileResponse = await encryptFile({
                  password: $password.value,
                  serializedInitializationVector: $serializedInitializationVector.value,
                  serializedEncryptionKeySalt: $serializedEncryptionKeySalt.value,
                  unencryptedFileBuffer: unencryptedFileBuffer,
                });

                if (!encryptFileResponse.success) return { success: false } as const;

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
                  return fail({ error: { message: "can't create file and update balance" } });
                const blob = convertArrayBufferToBlob(encryptFileResponse.data);

                const snapshot = await uploadFileBlob({ storage, id: response.data.file.id, blob });
                if (snapshot.success) return success({ data: { file: response.data.file } });
                return { success: false, error: { message: "file upload failed" } } as const;
              })();
              $isUploading.set(false);

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
            {!$isUploading.value && (
              <>
                <CloudArrowUpIcon className="size-6" /> Encrypt & Upload
              </>
            )}
            {$isUploading.value && <span className="loading loading-spinner loading-sm" />}
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
