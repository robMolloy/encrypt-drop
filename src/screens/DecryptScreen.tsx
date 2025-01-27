import { Typography } from "@/components";
import { Decryption } from "@/modules/encryption";

export const DecryptScreen = () => {
  return (
    <main className={`min-h-screen`}>
      <Typography fullPage>
        <div className="card w-full bg-neutral text-neutral-content">
          <div className="card-body">
            <Decryption />
            <br />
          </div>
        </div>
      </Typography>
    </main>
  );
};
