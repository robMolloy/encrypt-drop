import {
  generateEncryptionKeySalt,
  generateInitializationVector,
  serializeUInt8Array,
} from "@/modules/encryption";
import { useEffect } from "react";

export const Keys = (p: {
  generateNewKeysOnMount: boolean;
  serialisedEncryptionKeySalt: string;
  serialisedInitializationVector: string;
  onSerialisedEncryptionKeySaltChange: (x: string) => void;
  onSerialisedInitializationVectorChange: (x: string) => void;
}) => {
  useEffect(() => {
    if (!p.generateNewKeysOnMount) return;
    p.onSerialisedEncryptionKeySaltChange(serializeUInt8Array(generateEncryptionKeySalt()));
    p.onSerialisedInitializationVectorChange(serializeUInt8Array(generateInitializationVector()));
  }, []);

  return (
    <div className="rounded-xs collapse-xs collapse border">
      <input type="checkbox" />
      <div className="collapse-title text-xl font-medium">Click to review keys</div>
      <div className="collapse-content">
        <p>
          Without these keys or the password you will not be able to decrypt the file. If you are
          using the upload service, the keys are stored in the database.
        </p>
        <span className="flex items-end gap-2">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Serialized Encryption Key Salt</span>
            </div>
            <input
              type="text"
              value={p.serialisedEncryptionKeySalt}
              onChange={(x) => p.onSerialisedEncryptionKeySaltChange(x.target.value)}
              placeholder="Type here"
              className="input input-bordered w-full"
            />
          </label>
          <button
            className="btn btn-primary"
            onClick={async () => {
              p.onSerialisedEncryptionKeySaltChange(
                serializeUInt8Array(generateEncryptionKeySalt()),
              );
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
              value={p.serialisedInitializationVector}
              onChange={(e) => p.onSerialisedInitializationVectorChange(e.target.value)}
              placeholder="Type here"
              className="input input-bordered w-full"
            />
          </label>
          <button
            className="btn btn-primary"
            onClick={() => {
              p.onSerialisedInitializationVectorChange(
                serializeUInt8Array(generateInitializationVector()),
              );
            }}
          >
            New
          </button>
        </span>
      </div>
    </div>
  );
};
