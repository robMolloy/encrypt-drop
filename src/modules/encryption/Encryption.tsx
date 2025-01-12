import { useRef, useState } from "react";
import { useNotifyStore } from "../notify";
import { encryptFile } from "./utils";

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

      <a
        type="button"
        className={`btn ${step === "download-file" ? "btn-primary" : "btn-disabled"}`}
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
        Download Encrypted File
      </a>
    </span>
  );
};
