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
      <th></th>
    </tr>
  );
};

export const DisplayFilesTable = () => {
  const filesStore = useFilesStore();
  const fileStatuses = $<
    Record<string, { status: "loading" | "success" | "failed"; blob: Blob | undefined }>
  >({});
  return (
    <>
      {filesStore.docs.length === 0 && <div>No files</div>}
      {filesStore.docs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table table-xs m-0">
            <thead>
              <TableHeadingRowContents />
            </thead>
            <tbody>
              {filesStore.docs.map((x, j) => {
                return (
                  <React.Fragment key={`display-files-table-${x.id}`}>
                    <tr className="b border-b-0">
                      <th>{j + 1}</th>
                      <td>{x.name}</td>
                      <td className="max-w-12 overflow-hidden text-ellipsis whitespace-nowrap">
                        {x.serializedEncryptionKeySalt}
                      </td>
                      <td>{x.createdAt.toDate().toLocaleString()}</td>
                      <td>{x.updatedAt.toDate().toLocaleString()}</td>
                      <td className="text-center">
                        {fileStatuses.value[x.id]?.status !== "success" && (
                          <button
                            className={`btn btn-primary btn-xs`}
                            onClick={async () => {
                              if (fileStatuses.value[x.id]?.status !== undefined) return;

                              const loadingStatus = { status: "loading", blob: undefined } as const;
                              fileStatuses.set((y) => ({ ...y, [x.id]: loadingStatus }));

                              const blobResponse = await downloadFileBlob({ storage, id: x.id });
                              const newStatus = {
                                status: blobResponse.success ? "success" : "failed",
                                blob: blobResponse.data,
                              } as const;
                              return fileStatuses.set((y) => ({ ...y, [x.id]: newStatus }));
                            }}
                          >
                            {fileStatuses.value[x.id] === undefined && <>Download</>}
                            {fileStatuses.value[x.id]?.status === "loading" && (
                              <span className="loading loading-spinner loading-sm" />
                            )}
                            {fileStatuses.value[x.id]?.status === "success" && (
                              <>Click to download</>
                            )}
                            {fileStatuses.value[x.id]?.status === "failed" && <>Failed</>}
                          </button>
                        )}
                        {fileStatuses.value[x.id]?.status === "success" &&
                          (() => {
                            const status = fileStatuses.value[x.id];
                            if (status?.blob === undefined) return <></>;

                            return (
                              <a
                                className={`btn btn-primary btn-xs`}
                                href={URL.createObjectURL(status.blob)}
                                download={x.name}
                              >
                                <>Save</>
                              </a>
                            );
                          })()}
                      </td>
                    </tr>
                    {fileStatuses.value[x.id]?.status === "success" &&
                      (() => {
                        const status = fileStatuses.value[x.id];
                        if (!status?.blob) return;
                        return (
                          <tr>
                            <th></th>
                            <td className="col-spa col-span-5" colSpan={5}>
                              <div className="flex justify-around gap-2">
                                <a
                                  className={`btn btn-primary btn-xs`}
                                  href={URL.createObjectURL(status.blob)}
                                  download={x.name}
                                >
                                  <>Save Encrypted File</>
                                </a>
                                <a
                                  className={`btn btn-primary btn-xs`}
                                  href={URL.createObjectURL(status.blob)}
                                  download={x.name}
                                >
                                  <>Save Decrypted File</>
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })()}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <TableHeadingRowContents />
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
};
