import { decryptFile } from "./utils";
import { useRef, useState } from "react";

export const Decryption = (p: { encryptionKey: CryptoKey; initializationVector: Uint8Array }) => {
  const fileUploadElementRef = useRef<HTMLInputElement>(null);
  const [encryptedFileBuffer, setEncryptedFileBuffer] = useState<ArrayBuffer>();
  const [decryptedFileBuffer, setDecryptedFileBuffer] = useState<ArrayBuffer>();

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
          const tempDecryptedFileBuffer = await decryptFile({
            initializationVector: p.initializationVector,
            encryptionKey: p.encryptionKey,
            encryptedFileBuffer,
          });
          setDecryptedFileBuffer(tempDecryptedFileBuffer);
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
