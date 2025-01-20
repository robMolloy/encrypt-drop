import { Typography } from "@/components";
import { DisplayFilesTable } from "@/modules/getFiles/GetFiles";

export const FilesScreen = () => {
  return (
    <main>
      <Typography fullPage>
        <div className="rounded-lg bg-base-300 p-6">
          <DisplayFilesTable />
        </div>
      </Typography>
    </main>
  );
};
