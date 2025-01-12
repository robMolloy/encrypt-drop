import { encryptFile } from "./utils";
import { useRef, useState } from "react";

export const Encryption = (p: { encryptionKey: CryptoKey; initializationVector: Uint8Array }) => {
  const fileUploadElementRef = useRef<HTMLInputElement>(null);
  const [unencryptedFileBuffer, setUnencryptedFileBuffer] = useState<ArrayBuffer>();
  const [encryptedFileBuffer, setEncryptedFileBuffer] = useState<ArrayBuffer>();

  return (
    <span className="flex flex-col gap-4">
      <span className="flex gap-2">
        <input
          disabled={!!unencryptedFileBuffer}
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
          disabled={!unencryptedFileBuffer}
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
        disabled={!unencryptedFileBuffer || !!encryptedFileBuffer}
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

      <a
        type="button"
        className={`btn ${encryptedFileBuffer ? "btn-primary" : "btn-disabled"}`}
        href={
          encryptedFileBuffer
            ? URL.createObjectURL(
                new Blob([encryptedFileBuffer], { type: "application/octet-stream" }),
              )
            : "#"
        }
        download="encryptedFile.bin"
      >
        Download Encrypted File
      </a>
    </span>
  );
};
