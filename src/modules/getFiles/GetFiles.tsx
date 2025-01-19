import { storage } from "@/config/firebaseConfig";
import { downloadFileBlob } from "@/db/firebaseStorageSdkUtils";
import { useFilesStore } from "@/stores/useFilesStore";
import { $ } from "@/utils/useReactive";

const TableHeadingRowContents = () => {
  return (
    <tr>
      <th></th>
      <th>Name</th>
      <th>Serialized Salt</th>
      <th>createdAt</th>
      <th>updatedAt</th>
      <th>Download</th>
    </tr>
  );
};

export const DisplayFilesTable = () => {
  const filesStore = useFilesStore();
  // const downloadFileBlobStatuses2 = $<
  //   { id: string; status: "loading" | "success" | "failed"; blob: Blob }[]
  // >([]);
  const downloadFileBlobStatuses = $<
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
                  <tr key={`display-files-table-${x.id}`}>
                    <th>{j + 1}</th>
                    <td>{x.name}</td>
                    <td className="max-w-12 overflow-hidden text-ellipsis whitespace-nowrap">
                      {x.serializedEncryptionKeySalt}
                    </td>
                    <td>{x.createdAt.toDate().toLocaleString()}</td>
                    <td>{x.updatedAt.toDate().toLocaleString()}</td>
                    <td className="text-center">
                      <button
                        className={`btn btn-primary btn-xs`}
                        onClick={async () => {
                          downloadFileBlobStatuses.set((statuses) => ({
                            ...statuses,
                            [x.id]: { status: "loading", blob: undefined },
                          }));
                          const blobResponse = await downloadFileBlob({ storage, id: x.id });
                          return downloadFileBlobStatuses.set((statuses) => ({
                            ...statuses,
                            [x.id]: {
                              status: blobResponse.success ? "success" : "failed",
                              blob: blobResponse.data,
                            },
                          }));
                        }}
                      >
                        {downloadFileBlobStatuses.value[x.id] === undefined && <>\/</>}
                        {downloadFileBlobStatuses.value[x.id]?.status === "loading" && (
                          <span className="loading loading-spinner loading-sm" />
                        )}
                        {downloadFileBlobStatuses.value[x.id]?.status === "success" && (
                          <>Click to download</>
                        )}
                        {downloadFileBlobStatuses.value[x.id]?.status === "failed" && <>Failed</>}
                      </button>
                    </td>
                  </tr>
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
