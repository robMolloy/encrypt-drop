import { fail, success } from "@/utils/devUtils";
import { downloadFile } from "@/utils/fileUtils";
import { $, useReactive } from "@/utils/useReactive";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import { useNotifyStore } from "../notify";
import { Keys } from "./Keys";
import { decryptFile } from "./utils";
// import { encryptFile } from "./utils";

export const Decryption = () => {
  const notifyStore = useNotifyStore();

  const $password = useReactive("");
  const $serializedEncryptionKeySalt = useReactive("");
  const $serializedInitializationVector = useReactive("");
  const fileUploadElementRef = useRef<HTMLInputElement>(null);
  const [encryptedFileBuffer, setEncryptedFileBuffer] = useState<ArrayBuffer>();
  const $isDownloading = $(false);
  const $fileName = $("");

  const step = (() => {
    if (!encryptedFileBuffer) return "add-file";
    return "download-file";
  })();

  const resetForm = () => {
    setEncryptedFileBuffer(undefined);
    $fileName.set("");

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
            setEncryptedFileBuffer(fileBuffer);
            $fileName.set(file.name.split(".").slice(0, -1).join("."));
          }}
        />
        <button
          disabled={step === "add-file"}
          onClick={() => resetForm()}
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

      <span className="flex gap-2">
        <button
          className="btn btn-primary flex-1"
          disabled={step === "add-file" || $isDownloading.value}
          onClick={async () => {
            if ($isDownloading.value) return;

            $isDownloading.set(true);

            const decryptFileResponse = await (() => {
              if (!encryptedFileBuffer) return fail({ error: { message: "No file selected" } });

              return decryptFile({
                password: $password.value,
                serializedInitializationVector: $serializedInitializationVector.value,
                serializedEncryptionKeySalt: $serializedEncryptionKeySalt.value,
                encryptedFileBuffer,
              });
            })();

            $isDownloading.set(false);

            if (!decryptFileResponse.success)
              return notifyStore.push({ heading: "Could not decrypt file" });

            downloadFile({ fileName: $fileName.value, fileBuffer: decryptFileResponse.data });
          }}
        >
          <DocumentArrowDownIcon className="size-6" />{" "}
          {$isDownloading.value ? "Downloading..." : "Decrypt & Download"}
        </button>
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
