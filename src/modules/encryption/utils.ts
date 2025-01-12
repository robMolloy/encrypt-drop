export const generateInitializationVector = async () => {
  return crypto.getRandomValues(new Uint8Array(12));
};
export const generateEncryptionKeySalt = async () => {
  return crypto.getRandomValues(new Uint8Array(16));
};

export const deriveEncryptionKey = async (x: { password: string; salt: Uint8Array }) => {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(x.password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: x.salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

export const decryptFile = async (x: {
  initializationVector: Uint8Array;
  password: string;
  salt: Uint8Array;
  encryptedFileBuffer: ArrayBuffer;
}) => {
  try {
    const encryptionKey = await deriveEncryptionKey({
      password: x.password,
      salt: x.salt,
    });
    const decryptedFile = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: x.initializationVector },
      encryptionKey,
      x.encryptedFileBuffer,
    );

    return { success: true, data: decryptedFile } as const;
  } catch (e) {
    const error = e as { message: string };
    console.error(`utils.ts:${/*LL*/ 52}`, { error });
    return { success: false, error } as const;
  }
};

export const encryptFile = async (x: {
  initializationVector: Uint8Array;
  password: string;
  salt: Uint8Array;
  unencryptedFileBuffer: ArrayBuffer;
}) => {
  try {
    const encryptionKey = await deriveEncryptionKey({
      password: x.password,
      salt: x.salt,
    });
    const encryptedFile = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: x.initializationVector },
      encryptionKey,
      x.unencryptedFileBuffer,
    );
    return { success: true, data: encryptedFile } as const;
  } catch (e) {
    const error = e as { message: string };
    console.error(`utils.ts:${/*LL*/ 76}`, { error });
    return { success: false, error } as const;
  }
};

export const serializeUInt8Array = (arr: Uint8Array) => {
  const serialized = JSON.stringify(Array.from(arr));

  return serialized;
};

export const deserializeUInt8Array = (str: string) => {
  try {
    const deserialized = new Uint8Array(JSON.parse(str));

    return { success: true, data: deserialized } as const;
  } catch (e) {
    const error = e as { message: string };
    console.error(`utils.ts:${/*LL*/ 94}`, { error });
    return { success: false, error } as const;
  }
};
