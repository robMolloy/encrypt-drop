export const generateInitializationVector = async () => {
  return crypto.getRandomValues(new Uint8Array(12));
};
export const generateEncryptionKeySalt = async () => {
  return crypto.getRandomValues(new Uint8Array(16));
};

export const deriveEncryptionKey = async (x: {
  password: string;
  serializedEncryptionKeySalt: string;
}) => {
  try {
    const encryptionKeySaltResponse = deserializeUInt8Array(x.serializedEncryptionKeySalt);
    if (!encryptionKeySaltResponse.success) return { success: false } as const;

    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(x.password),
      "PBKDF2",
      false,
      ["deriveKey"],
    );

    const data = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encryptionKeySaltResponse.data,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
    return { success: true, data } as const;
  } catch (e) {
    const error = e as { message: string };
    console.error(`utils.ts:${/*LL*/ 16}`, { error });
    return { success: false, error } as const;
  }
};

export const decryptFile = async (x: {
  serializedInitializationVector: string;
  password: string;
  serializedEncryptionKeySalt: string;
  encryptedFileBuffer: ArrayBuffer;
}) => {
  try {
    const initializationVectorResponse = deserializeUInt8Array(x.serializedInitializationVector);
    const encryptionKeySaltResponse = deserializeUInt8Array(x.serializedEncryptionKeySalt);
    if (!initializationVectorResponse.success || !encryptionKeySaltResponse.success)
      return { success: false } as const;

    const encryptionKeyResponse = await deriveEncryptionKey({
      password: x.password,
      serializedEncryptionKeySalt: x.serializedEncryptionKeySalt,
    });
    if (!encryptionKeyResponse.success) return { success: false } as const;
    const encryptionKey = encryptionKeyResponse.data;
    const decryptedFile = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: initializationVectorResponse.data },
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
  password: string;
  serializedInitializationVector: string;
  serializedEncryptionKeySalt: string;
  unencryptedFileBuffer: ArrayBuffer;
}) => {
  try {
    const encryptionKeySaltResponse = deserializeUInt8Array(x.serializedEncryptionKeySalt);
    if (!encryptionKeySaltResponse.success) return { success: false } as const;
    const initializationVectorResponse = deserializeUInt8Array(x.serializedInitializationVector);
    if (!initializationVectorResponse.success) return { success: false } as const;
    const encryptionKeyResponse = await deriveEncryptionKey({
      password: x.password,
      serializedEncryptionKeySalt: x.serializedEncryptionKeySalt,
    });
    if (!encryptionKeyResponse.success) return { success: false } as const;

    const encryptedFile = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: initializationVectorResponse.data },
      encryptionKeyResponse.data,
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
