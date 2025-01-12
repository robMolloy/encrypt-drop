import { useNotifyStore } from "../notify";
import { decryptFile } from "./utils";
import { useEffect, useRef, useState } from "react";

export const Decryption = (p: { encryptionKey: CryptoKey; initializationVector: Uint8Array }) => {
  const notifyStore = useNotifyStore();

  const fileUploadElementRef = useRef<HTMLInputElement>(null);
  const [encryptedFileBuffer, setEncryptedFileBuffer] = useState<ArrayBuffer>();
  const [decryptedFileBuffer, setDecryptedFileBuffer] = useState<ArrayBuffer>();

  useEffect(() => {
    setDecryptedFileBuffer(undefined);
  }, [p.encryptionKey, p.initializationVector]);

  return (
    <span className="flex flex-col gap-4">
      <span className="flex gap-2">
        <input
          disabled={!!encryptedFileBuffer}
          ref={fileUploadElementRef}
          type="file"
          className="file-input w-full"
          onInput={async () => {
            const fileInput = fileUploadElementRef.current;
            if (!fileInput) return { success: false } as const;

            const file = fileInput.files?.[0];
            if (!file) return { success: false } as const;

            const fileBuffer = await file.arrayBuffer();
            setEncryptedFileBuffer(fileBuffer);
          }}
        />
        <button
          disabled={!encryptedFileBuffer}
          onClick={() => {
            const fileInput = fileUploadElementRef.current;
            if (!fileInput) return { success: false } as const;

            fileInput.value = "";
            setEncryptedFileBuffer(undefined);
            setDecryptedFileBuffer(undefined);
          }}
          className="btn btn-outline"
        >
          X
        </button>
      </span>

      <button
        disabled={!encryptedFileBuffer || !!decryptedFileBuffer}
        type="button"
        className="btn btn-primary"
        onClick={async () => {
          if (!encryptedFileBuffer) return;
          const response = await decryptFile({
            initializationVector: p.initializationVector,
            encryptionKey: p.encryptionKey,
            encryptedFileBuffer,
          });

          if (response.success) return setDecryptedFileBuffer(response.data);
          notifyStore.push({
            type: "alert-warning",
            children: response.error.message
              ? response.error.message
              : "Unable to decrypt: likely due to an incorrect password",
          });
        }}
      >
        Decrypt File
      </button>

      <a
        type="button"
        className={`btn ${decryptedFileBuffer ? "btn-primary" : "btn-disabled"}`}
        href={
          decryptedFileBuffer
            ? URL.createObjectURL(
                new Blob([decryptedFileBuffer], { type: "application/octet-stream" }),
              )
            : "#"
        }
        download="decryptedFile.pdf"
      >
        Download Decrypted File
      </a>
    </span>
  );
};
