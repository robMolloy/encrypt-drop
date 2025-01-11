import { Typography } from "@/components";
import {
  Decryption,
  Encryption,
  PasswordInput,
  deriveEncryptionKey,
  generateInitializationVector,
} from "@/modules/encryption";
import { useState } from "react";

const Parent = () => {
  const [setting, setSetting] = useState<"Encrypt" | "Decrypt">("Encrypt");

  const [password, setPassword] = useState("");
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey>();
  const [initializationVector, setInitializationVector] = useState<Uint8Array>();

  return (
    <main className={`min-h-screen`}>
      <Typography fullPage>
        <h1>{setting}</h1>
        <button
          className="btn btn-primary"
          onClick={() => setSetting((x) => (x === "Decrypt" ? "Encrypt" : "Decrypt"))}
        >
          Change to {setting === "Decrypt" ? "Encrypt" : "Decrypt"}
        </button>
        <h2>Keys</h2>

        <br />
        <PasswordInput value={password} onChange={(x) => setPassword(x)} />

        <br />
        <span className="flex gap-4">
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => setEncryptionKey(await deriveEncryptionKey({ password }))}
          >
            Derive Encryption Key
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => setInitializationVector(await generateInitializationVector())}
          >
            Generate Initialisation Vector
          </button>
        </span>

        <br />

        {setting === "Encrypt" && (
          <>
            {encryptionKey && initializationVector ? (
              <Encryption
                encryptionKey={encryptionKey}
                initializationVector={initializationVector}
              />
            ) : (
              <div>Generate encryption & initializationVector keys to allow decryption</div>
            )}
          </>
        )}
        {setting === "Decrypt" && (
          <>
            {encryptionKey && initializationVector ? (
              <Decryption
                encryptionKey={encryptionKey}
                initializationVector={initializationVector}
              />
            ) : (
              <div>Generate encryption & initializationVector keys to allow decryption</div>
            )}
          </>
        )}
      </Typography>
    </main>
  );
};

export default Parent;
