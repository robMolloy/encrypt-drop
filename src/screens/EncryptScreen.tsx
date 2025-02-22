import { Typography } from "@/components";
import { auth } from "@/config/firebaseConfig";
import { Encryption } from "@/modules/encryption";

export const EncryptScreen = () => {
  return (
    <main className={`min-h-screen`}>
      <Typography fullPage>
        <div className="card w-full bg-neutral text-neutral-content">
          <div className="card-body">
            <Encryption uid={auth.currentUser?.uid} />
            <br />
          </div>
        </div>
      </Typography>
    </main>
  );
};
