import { convertArrayBufferToBlob } from "./dataTypeUtils";

export const downloadFile = (
  p: ({ fileBuffer: ArrayBuffer } | { fileBlob: Blob }) & {
    fileName: string;
  },
) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    "fileBuffer" in p ? convertArrayBufferToBlob(p.fileBuffer) : p.fileBlob,
  );
  link.download = p.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
