import {
  generateEncryptionKeySalt,
  generateInitializationVector,
  serializeUInt8Array,
} from "@/modules/encryption";
import { useEffect, useState } from "react";

export const Keys = (p: {
  onChange: (x: {
    serialisedEncryptionKeySalt: string;
    serialisedInitializationVector: string;
  }) => void;
}) => {
  const [serialisedEncryptionKeySalt, setSerialisedEncryptionKeySalt] = useState<string>("");

  const [serialisedInitializationVector, setSerialisedInitializationVector] = useState<string>("");

  useEffect(() => {
    (async () => {
      setSerialisedEncryptionKeySalt(serializeUInt8Array(await generateEncryptionKeySalt()));
      setSerialisedInitializationVector(serializeUInt8Array(await generateInitializationVector()));
    })();
  }, []);

  useEffect(() => {
    p.onChange({ serialisedEncryptionKeySalt, serialisedInitializationVector });
  }, [serialisedEncryptionKeySalt, serialisedInitializationVector]);
  return (
    <div className="bord rounded-xs collapse border-[1px] border-white">
      <input type="checkbox" />
      <div className="collapse-title text-xl font-medium">Click to review keys</div>
      <div className="collapse-content">
        <p>
          These are the keys used to encrypt and decrypt the file. It is important that all keys and
          passwords are kept in order to decrypt the file. If the any key or password is lost it
          will not be possible to decrypt the file.
        </p>
        <p>If you are using the upload service, the keys are stored in the database.</p>
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
  );
};
