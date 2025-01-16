export const convertArrayBufferToBlob = (arrayBuffer: ArrayBuffer) => {
  return new Blob([arrayBuffer], { type: "application/octet-stream" });
};
export const convertBlobToArrayBuffer = (blob: Blob) => {
  return blob.arrayBuffer();
};
