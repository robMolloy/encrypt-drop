import { encryptFile } from "./utils";
import { useRef, useState } from "react";

export const Encryption = (p: { encryptionKey: CryptoKey; initializationVector: Uint8Array }) => {
  const fileUploadElementRef = useRef<HTMLInputElement>(null);
  const [unencryptedFileBuffer, setUnencryptedFileBuffer] = useState<ArrayBuffer>();
  const [encryptedFileBuffer, setEncryptedFileBuffer] = useState<ArrayBuffer>();

  return (
    <>
      <span className="flex gap-4">
        <span>File to be encrypted:</span>
        <input
          disabled={!!unencryptedFileBuffer}
          ref={fileUploadElementRef}
          type="file"
          className="file-input w-full max-w-xs"
          onInput={async () => {
            const fileInput = fileUploadElementRef.current;
            if (!fileInput) return { success: false } as const;

            const file = fileInput.files?.[0];
            if (!file) return { success: false } as const;

            const fileBuffer = await file.arrayBuffer();
            setUnencryptedFileBuffer(fileBuffer);
          }}
        />

        {encryptedFileBuffer && (
          <a
            type="button"
            className="btn btn-primary"
            href={URL.createObjectURL(
              new Blob([encryptedFileBuffer], { type: "application/octet-stream" }),
            )}
            download="encryptedFile.bin"
          >
            Download Encrypted File
          </a>
        )}

        {unencryptedFileBuffer && !encryptedFileBuffer && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              if (!unencryptedFileBuffer) return;
              const tempEncryptedFileBuffer = await encryptFile({
                initializationVector: p.initializationVector,
                encryptionKey: p.encryptionKey,
                unencryptedFileBuffer,
              });
              setEncryptedFileBuffer(tempEncryptedFileBuffer);
            }}
          >
            Encrypt File
          </button>
        )}
      </span>
    </>
  );
};
