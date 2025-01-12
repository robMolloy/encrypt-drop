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
        <PasswordInput
          value={password}
          onChange={async (x) => {
            setPassword(x);
            debouncedHandleEncryptionKeyChange(x);
          }}
          onBlur={(x) => handleEncryptionKeyChange(x)}
        />
        <br />
        {(!encryptionKey || !initializationVector) && (
          <div>A password is required to encrypt or decrypt a file</div>
        )}
        {encryptionKey && initializationVector && (
          <div className="card w-full bg-neutral text-neutral-content">
            <div role="tablist" className="tabs tabs-bordered w-full">
              <div
                onClick={() => setSetting("Encrypt")}
                role="tab"
                className={`tab h-10 ${setting === "Encrypt" ? "tab-active" : "font-light opacity-80"}`}
              >
                <span>Encrypt</span>
              </div>
              <div
                onClick={() => setSetting("Decrypt")}
                role="tab"
                className={`tab h-10 ${setting === "Decrypt" ? "tab-active" : "font-light opacity-80"}`}
              >
                <span>Decrypt</span>
              </div>
            </div>
            <div className="card-body">
              {setting === "Encrypt" && encryptionKey && initializationVector && (
                <Encryption
                  encryptionKey={encryptionKey}
                  initializationVector={initializationVector}
                />
              )}
              {setting === "Decrypt" && encryptionKey && initializationVector && (
                <Decryption
                  encryptionKey={encryptionKey}
                  initializationVector={initializationVector}
                />
              )}
            </div>
          </div>
        )}
      </Typography>
    </main>
  );
};

export default Parent;
