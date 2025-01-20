import { storage } from "@/config/firebaseConfig";
import { downloadFileBlob } from "@/db/firebaseStorageSdkUtils";
import { useFilesStore } from "@/stores/useFilesStore";
import { $ } from "@/utils/useReactive";
import React from "react";

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

export const DisplayFilesTable = () => {
  const filesStore = useFilesStore();
  const fileStatuses = $<
    Record<
      string,
      {
        status: "loading" | "encrypted_file_downloaded" | "failed";
        password?: string;
        encryptedBlob?: Blob | undefined;
        unencryptedBlob?: Blob | undefined;
      }
    >
  >({});

  if (filesStore.docs.length === 0) return <div>No files</div>;

  return (
    <div className="overflow-x-auto">
      <table className="table table-xs m-0">
        <thead>
          <TableHeadingRowContents />
        </thead>
        <tbody>
          {filesStore.docs.map((x, j) => {
            const status = fileStatuses.value[x.id];
            return (
              <React.Fragment key={`display-files-table-${x.id}`}>
                <tr className="b border-b-0">
                  <th className="row-span-2" rowSpan={2}>
                    {j + 1}
                  </th>
                  <td>{x.name}</td>
                  <td className="max-w-12 overflow-hidden text-ellipsis whitespace-nowrap">
                    {x.serializedEncryptionKeySalt}
                  </td>
                  <td>{x.createdAt.toDate().toLocaleString()}</td>
                  <td>{x.updatedAt.toDate().toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="col-span-5 p-2" colSpan={5}>
                    {status?.status}
                    <div className="flex justify-around gap-2">
                      {status?.status !== "encrypted_file_downloaded" && (
                        <button
                          className={`btn btn-primary btn-xs`}
                          onClick={async () => {
                            if (status?.status !== undefined) return;

                            const loadingStatus = { status: "loading" } as const;
                            fileStatuses.set((y) => ({ ...y, [x.id]: loadingStatus }));

                            const blobResponse = await downloadFileBlob({ storage, id: x.id });
                            const newStatus = {
                              status: blobResponse.success ? "encrypted_file_downloaded" : "failed",
                              encryptedBlob: blobResponse.data,
                            } as const;
                            return fileStatuses.set((y) => ({ ...y, [x.id]: newStatus }));
                          }}
                        >
                          {status === undefined && <>Download</>}
                          {status?.status === "loading" && (
                            <span className="loading loading-spinner loading-sm" />
                          )}
                          {status?.status === "failed" && <>Failed</>}
                        </button>
                      )}

                      {status?.encryptedBlob && (
                        <a
                          className={`btn btn-primary btn-xs`}
                          href={URL.createObjectURL(status.encryptedBlob)}
                          download={x.name}
                        >
                          <>Save Encrypted File</>
                        </a>
                      )}
                      {status?.encryptedBlob && (
                        <a
                          className={`btn btn-primary btn-xs`}
                          href={URL.createObjectURL(status.encryptedBlob)}
                          download={x.name}
                        >
                          <>Save Decrypted File</>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
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
