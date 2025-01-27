import { Typography } from "@/components";
import { PasswordInput } from "@/modules/encryption";
import { useState } from "react";

export const DecryptScreen = () => {
  const [password, setPassword] = useState("");

  // const [serialisedEncryptionKeySalt, setSerialisedEncryptionKeySalt] = useState("");
  // const [serialisedInitializationVector, setSerialisedInitializationVector] = useState("");

  return (
    <main className={`min-h-screen`}>
      <Typography fullPage>
        <div className="card w-full bg-neutral text-neutral-content">
          <div className="card-body">
            <PasswordInput value={password} onChange={async (x) => setPassword(x)} />
            <br />
            {/* <Keys
              onChange={(val) => {
                setSerialisedEncryptionKeySalt(val.serialisedEncryptionKeySalt);
                setSerialisedInitializationVector(val.serialisedInitializationVector);
              }}
            /> */}
            <br />
            {/* <Decryption
              password={password}
              serializedEncryptionKeySalt={serialisedEncryptionKeySalt}
              serializedInitializationVector={serialisedInitializationVector}
            /> */}
          </div>
        </div>
      </Typography>
    </main>
  );
};
