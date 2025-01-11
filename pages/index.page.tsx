import { Typography } from "@/components";
import { useRef, useState } from "react";
import { Encryption } from "@/components/encryption/Encryption";
import { Decryption } from "@/components/decryption/Decryption";

const Parent = () => {
  const [setting, setSetting] = useState<"Encrypt" | "Decrypt">("Encrypt");

  const [encryptionKey, setEncryptionKey] = useState<CryptoKey>();
  const [initializationVector, setInitializationVector] = useState<Uint8Array>();

  const generateEncryptionKey = async () => {
    return window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
      "encrypt",
      "decrypt",
    ]);
  };

  const generateInitializationVector = async () => {
    return window.crypto.getRandomValues(new Uint8Array(12));
  };

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
        <span className="flex gap-4">
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => setEncryptionKey(await generateEncryptionKey())}
          >
            Generate Encryption Key
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
