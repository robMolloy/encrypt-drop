import { useEffect, useRef, useState } from "react";
import { useNotifyStore } from "../notify";
import { decryptFile } from "./utils";

export const Decryption = (p: {
  password: string;
  salt: Uint8Array;
  initializationVector: Uint8Array;
}) => {
  const notifyStore = useNotifyStore();

  const fileUploadElementRef = useRef<HTMLInputElement>(null);
  const [encryptedFileBuffer, setEncryptedFileBuffer] = useState<ArrayBuffer>();
  const [decryptedFileBuffer, setDecryptedFileBuffer] = useState<ArrayBuffer>();
  const [fileNameAndExtension, setFileNameAndExtension] = useState<string>("");

  useEffect(() => {
    const tempFileName = fileUploadElementRef.current?.files?.[0]?.name;
    if (!tempFileName) return setFileNameAndExtension("");

    const newFileName =
      tempFileName.slice(-4) === ".bin" ? tempFileName.slice(0, -4) : tempFileName;
    setFileNameAndExtension(newFileName);
  }, [fileUploadElementRef.current?.files?.[0]]);

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
            password: p.password,
            salt: p.salt,
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
      <label className="form-control w-full">
        <div className={`label ${!decryptedFileBuffer ? "opacity-10" : ""}`}>
          <span className="label-text">File name (include extension - .pdf, .doc, etc.)</span>
        </div>
        <input
          type="text"
          disabled={!decryptedFileBuffer}
          value={fileNameAndExtension}
          onChange={(x) => setFileNameAndExtension(x.target.value)}
          className="input input-bordered w-full"
        />
      </label>

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
        download={fileNameAndExtension}
      >
        Download Decrypted File
      </a>
    </span>
  );
};
