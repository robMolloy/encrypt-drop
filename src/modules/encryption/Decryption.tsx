import { decryptFile } from "./utils";
import { useRef, useState } from "react";

export const Decryption = (p: { encryptionKey: CryptoKey; initializationVector: Uint8Array }) => {
  const fileUploadElementRef = useRef<HTMLInputElement>(null);
  const [encryptedFileBuffer, setEncryptedFileBuffer] = useState<ArrayBuffer>();
  const [decryptedFileBuffer, setDecryptedFileBuffer] = useState<ArrayBuffer>();

  return (
    <span>
      <span>File to be decrypted:</span>
      <input
        disabled={!!encryptedFileBuffer}
        ref={fileUploadElementRef}
        type="file"
        className="file-input w-full max-w-xs"
        onInput={async () => {
          const fileInput = fileUploadElementRef.current;
          if (!fileInput) return { success: false } as const;

          const file = fileInput.files?.[0];
          if (!file) return { success: false } as const;

          const fileBuffer = await file.arrayBuffer();
          setEncryptedFileBuffer(fileBuffer);
        }}
      />

      {decryptedFileBuffer && (
        <a
          type="button"
          className="btn btn-primary"
          href={URL.createObjectURL(
            new Blob([decryptedFileBuffer], { type: "application/octet-stream" }),
          )}
          download="decryptedFile.pdf"
        >
          Download Decrypted File
        </a>
      )}

      <br />

      {encryptedFileBuffer && !decryptedFileBuffer && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            if (!encryptedFileBuffer) return;
            const tempDecryptedFile = await decryptFile({
              initializationVector: p.initializationVector,
              encryptionKey: p.encryptionKey,
              encryptedFileBuffer,
            });
            setDecryptedFileBuffer(tempDecryptedFile);
          }}
        >
          Decrypt File
        </button>
      )}
    </span>
  );
};
