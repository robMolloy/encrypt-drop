import { Typography } from "@/components";
import { auth } from "@/config/firebaseConfig";
import { Encryption, PasswordInput } from "@/modules/encryption";
import { Keys } from "@/modules/encryption/Keys";
import { useState } from "react";

export const EncryptScreen = () => {
  const [password, setPassword] = useState("");

  const [serialisedEncryptionKeySalt, setSerialisedEncryptionKeySalt] = useState<string>("");
  const [serialisedInitializationVector, setSerialisedInitializationVector] = useState<string>("");

  return (
    <main className={`min-h-screen`}>
      <Typography fullPage>
        <div className="card w-full bg-neutral text-neutral-content">
          <div className="card-body">
            <PasswordInput value={password} onChange={async (x) => setPassword(x)} />
            <br />
            <Keys
              onChange={(val) => {
                setSerialisedEncryptionKeySalt(val.serialisedEncryptionKeySalt);
                setSerialisedInitializationVector(val.serialisedInitializationVector);
              }}
            />

            <br />
            <div role="tablist" className="tabs tabs-bordered w-full"></div>
            <Encryption
              uid={auth.currentUser?.uid}
              password={password}
              serializedEncryptionKeySalt={serialisedEncryptionKeySalt}
              serializedInitializationVector={serialisedInitializationVector}
            />
          </div>
        </div>
      </Typography>
    </main>
  );
};
