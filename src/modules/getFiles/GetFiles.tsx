import { useFilesStore } from "@/stores/useFilesStore";

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
                      <button className="btn btn-primary btn-xs" onClick={() => {}}>
                        \/
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
