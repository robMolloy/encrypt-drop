import { Typography } from "@/components";
import {
  Decryption,
  Encryption,
  PasswordInput,
  deriveEncryptionKey,
  generateInitializationVector,
} from "@/modules/encryption";
import { useEffect, useState } from "react";
import debounce from "lodash/debounce";

const Parent = () => {
  const [setting, setSetting] = useState<"Encrypt" | "Decrypt">("Encrypt");

  const [password, setPassword] = useState("");
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey>();
  const [initializationVector, setInitializationVector] = useState<Uint8Array>();

  useEffect(() => {
    (async () => setInitializationVector(await generateInitializationVector()))();
  }, []);

  const handleEncryptionKeyChange = async (x: string) => {
    setEncryptionKey(await deriveEncryptionKey({ password: x }));
  };

  const debouncedHandleEncryptionKeyChange = debounce(handleEncryptionKeyChange, 300);

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

        <br />
        <PasswordInput
          value={password}
          onChange={async (x) => {
            setPassword(x);
            debouncedHandleEncryptionKeyChange(x);
          }}
          onBlur={handleEncryptionKeyChange}
        />

        <br />

        {(!encryptionKey || !initializationVector) && (
          <div>A password is required to encrypt or decrypt a file</div>
        )}

        {setting === "Encrypt" && encryptionKey && initializationVector && (
          <Encryption encryptionKey={encryptionKey} initializationVector={initializationVector} />
        )}
        {setting === "Decrypt" && encryptionKey && initializationVector && (
          <Decryption encryptionKey={encryptionKey} initializationVector={initializationVector} />
        )}
      </Typography>
    </main>
  );
};

export default Parent;
