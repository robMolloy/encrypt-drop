import { storage } from "@/config/firebaseConfig";
import { downloadFileBlob } from "@/db/firebaseStorageSdkUtils";
import { fileSchema } from "@/db/firestoreFilesSdk";
import { useFilesStore } from "@/stores/useFilesStore";
import { convertArrayBufferToBlob, convertBlobToArrayBuffer } from "@/utils/dataTypeUtils";
import { $ } from "@/utils/useReactive";
import React from "react";
import { z } from "zod";
import { decryptFile, deserializeUInt8Array } from "../encryption";

const TableHeadingRowContents = () => {
  return (
    <tr>
      <th></th>
      <th>Name</th>
      <th>Serialized Salt</th>
      <th>createdAt</th>
      <th>updatedAt</th>
    </tr>
  );
};
const DisplayFileTableRow = (p: { file: z.infer<typeof fileSchema>; i: number }) => {
  const $status = $<"init" | "loading" | "encrypted_file_downloaded" | "file_decrypted" | "failed">(
    "init",
  );
  const $password = $("");
  const $encryptedBlob = $<Blob>();
  const $decryptedBlob = $<Blob>();
  return (
    <>
      <tr className="b border-b-0">
        <th className="row-span-2" rowSpan={2}>
          {p.i + 1}
        </th>
        <td>{p.file.name}</td>
        <td className="max-w-12 overflow-hidden text-ellipsis whitespace-nowrap">
          {p.file.serializedEncryptionKeySalt}
        </td>
        <td>{p.file.createdAt.toDate().toLocaleString()}</td>
        <td>{p.file.updatedAt.toDate().toLocaleString()}</td>
      </tr>
      <tr>
        <td className="col-span-5 p-2" colSpan={5}>
          {$status.value}
          <div className="flex justify-end gap-2">
            {($status.value === "init" || $status.value === "loading") && (
              <button
                className={`btn btn-primary btn-xs`}
                onClick={async () => {
                  $status.set("loading");

                  const blobResponse = await downloadFileBlob({ storage, id: p.file.id });
                  $encryptedBlob.set(blobResponse.success ? blobResponse.data : undefined);
                  $status.set(blobResponse.success ? "encrypted_file_downloaded" : "failed");
                }}
              >
                {$status.value === "init" && <>Download</>}
                {$status.value === "loading" && (
                  <span className="loading loading-spinner loading-sm" />
                )}
              </button>
            )}
            {$status.value === "failed" && (
              <button
                className={`btn btn-error btn-xs`}
                onClick={async () => {
                  $status.set("init");
                }}
              >
                Try again
              </button>
            )}

            {$status.value === "encrypted_file_downloaded" && (
              <>
                <input
                  value={$password.value}
                  onChange={(e) => $password.set(e.target.value)}
                  type="password"
                  placeholder="Type here"
                  className="input input-sm input-bordered w-full max-w-xs"
                />
                <button
                  className={`btn btn-primary btn-xs`}
                  onClick={async () => {
                    const saltResponse = deserializeUInt8Array(p.file.serializedEncryptionKeySalt);
                    if (!$encryptedBlob.value || !saltResponse.success) return;
                    const initializationVectorResponse = await deserializeUInt8Array(
                      p.file.serializedInitializationVector,
                    );
                    const encryptedFileBuffer = await convertBlobToArrayBuffer(
                      $encryptedBlob.value,
                    );
                    const initializationVector = initializationVectorResponse.data;
                    if (!initializationVector) return;
                    const response = await decryptFile({
                      initializationVector,
                      encryptedFileBuffer,
                      password: $password.value,
                      salt: saltResponse.data,
                    });
                    if (!response.success) return $status.set("failed");
                    $decryptedBlob.set(convertArrayBufferToBlob(response.data));
                    $status.set("file_decrypted");
                  }}
                >
                  Decrypt File
                </button>
              </>
            )}
            {$status.value === "file_decrypted" && $decryptedBlob.value && (
              <a
                className={`btn btn-primary btn-xs`}
                href={URL.createObjectURL($decryptedBlob.value)}
                download={p.file.name}
              >
                Save Decrypted File
              </a>
            )}
            {/*
            {$encryptedBlob.value && (
              <a
                className={`btn btn-primary btn-xs`}
                href={URL.createObjectURL($encryptedBlob.value)}
                download={p.file.name}
              >
                <>Save Decrypted File</>
              </a>
            )} */}
          </div>
        </td>
      </tr>
    </>
  );
};

export const DisplayFilesTable = () => {
  const filesStore = useFilesStore();

  if (filesStore.docs.length === 0) return <div>No files</div>;

  return (
    <div className="overflow-x-auto">
      <table className="table table-xs m-0">
        <thead>
          <TableHeadingRowContents />
        </thead>
        <tbody>
          {filesStore.docs.map((x, j) => {
            return (
              <React.Fragment key={`display-files-table-${x.id}`}>
                <DisplayFileTableRow i={j} file={x} />
              </React.Fragment>
            );
          })}
        </tbody>
        <tfoot>
          <TableHeadingRowContents />
        </tfoot>
      </table>
    </div>
  );
};
