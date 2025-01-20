import { Typography } from "@/components";
import { auth } from "@/config/firebaseConfig";
import {
  Decryption,
  deserializeUInt8Array,
  Encryption,
  generateEncryptionKeySalt,
  generateInitializationVector,
  PasswordInput,
  serializeUInt8Array,
} from "@/modules/encryption";
import { DisplayFilesTable } from "@/modules/getFiles/GetFiles";
import { useEffect, useState } from "react";

const Parent = () => {
  const [mode, setMode] = useState<"Encrypt" | "Decrypt" | "Get">("Encrypt");

  const [password, setPassword] = useState("");

  const [serialisedEncryptionKeySalt, setSerialisedEncryptionKeySalt] = useState<string>("");
  const [encryptionKeySalt, setEncryptionKeySalt] = useState<Uint8Array>();

  const [serialisedInitializationVector, setSerialisedInitializationVector] = useState<string>("");
  const [initializationVector, setInitializationVector] = useState<Uint8Array>();

  useEffect(() => {
    (async () => {
      setSerialisedEncryptionKeySalt(serializeUInt8Array(await generateEncryptionKeySalt()));
      setSerialisedInitializationVector(serializeUInt8Array(await generateInitializationVector()));
    })();
  }, []);

  useEffect(() => {
    if (!serialisedEncryptionKeySalt) return;
    const response = deserializeUInt8Array(serialisedEncryptionKeySalt);
    setEncryptionKeySalt(response.success ? response.data : undefined);
  }, [serialisedEncryptionKeySalt]);

  useEffect(() => {
    if (!serialisedInitializationVector) return;
    const response = deserializeUInt8Array(serialisedInitializationVector);
    setInitializationVector(response.success ? response.data : undefined);
  }, [serialisedInitializationVector]);

  return (
    <main className={`min-h-screen`}>
      <Typography fullPage>
        <PasswordInput
          value={password}
          onChange={async (x) => {
            setPassword(x);
          }}
        />
        <br />
        <div className="collapse bg-base-200">
          <input type="checkbox" />
          <div className="collapse-title text-xl font-medium">Click to review keys</div>
          <div className="collapse-content">
            <p>
              These are the keys used to encrypt and decrypt the file. The Initialisation Vector is
              used to encrypt the file is not required to decrypt the file, but it is important that
              the Encryption Key Salt is kept like a password. If you lose the Encryption Key Salt
              or the password there is no way to decrypt the file.
            </p>
            <span className="flex items-end gap-2">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Serialized Encryption Key Salt</span>
                </div>
                <input
                  type="text"
                  value={serialisedEncryptionKeySalt}
                  onChange={(x) => setSerialisedEncryptionKeySalt(x.target.value)}
                  placeholder="Type here"
                  className="input input-bordered w-full"
                />
              </label>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  const tempEncryptionKeySalt = await generateEncryptionKeySalt();
                  setSerialisedEncryptionKeySalt(serializeUInt8Array(tempEncryptionKeySalt));
                }}
              >
                New
              </button>
            </span>
            <span className="flex items-end gap-2">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Serialized Initialisation Vector</span>
                </div>
                <input
                  type="text"
                  value={serialisedInitializationVector}
                  onChange={(x) => setSerialisedInitializationVector(x.target.value)}
                  placeholder="Type here"
                  className="input input-bordered w-full"
                />
              </label>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  const tempInitializationVector = await generateInitializationVector();
                  setSerialisedInitializationVector(serializeUInt8Array(tempInitializationVector));
                }}
              >
                New
              </button>
            </span>
          </div>
        </div>

        <br />
        {(!password || !initializationVector || !encryptionKeySalt) && (
          <div>A password is required to encrypt or decrypt a file</div>
        )}
        {password && initializationVector && encryptionKeySalt && (
          <div className="card w-full bg-neutral text-neutral-content">
            <div role="tablist" className="tabs tabs-bordered w-full">
              <div
                onClick={() => setMode("Encrypt")}
                role="tab"
                className={`tab h-10 text-lg ${mode === "Encrypt" ? "tab-active" : "font-light opacity-80"}`}
              >
                <span>Encrypt</span>
              </div>
              <div
                onClick={() => setMode("Decrypt")}
                role="tab"
                className={`tab h-10 text-lg ${mode === "Decrypt" ? "tab-active" : "font-light opacity-80"}`}
              >
                <span>Decrypt</span>
              </div>
              <div
                onClick={() => setMode("Get")}
                role="tab"
                className={`tab h-10 text-lg ${mode === "Get" ? "tab-active" : "font-light opacity-80"}`}
              >
                <span>Get</span>
              </div>
            </div>
            <div className="card-body">
              <span className={mode === "Encrypt" ? "" : "hidden"}>
                <Encryption
                  uid={auth.currentUser?.uid}
                  password={password}
                  serializedEncryptionKeySalt={serialisedEncryptionKeySalt}
                  serializedInitializationVector={serialisedInitializationVector}
                />
              </span>
              <span className={mode === "Decrypt" ? "" : "hidden"}>
                <Decryption
                  password={password}
                  serializedEncryptionKeySalt={serialisedEncryptionKeySalt}
                  serializedInitializationVector={serialisedInitializationVector}
                />
              </span>
              <span className={mode === "Get" ? "" : "hidden"}>
                <DisplayFilesTable />
              </span>
            </div>
          </div>
        )}
      </Typography>
    </main>
  );
};

export default Parent;
