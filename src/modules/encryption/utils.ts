export const generateInitializationVector = async () => {
  return window.crypto.getRandomValues(new Uint8Array(12));
};

export const deriveEncryptionKey = async (x: { password: string; salt: Uint8Array }) => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(x.password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: x.salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
};

export const decryptFile = async (x: {
  initializationVector: Uint8Array;
  encryptionKey: CryptoKey;
  encryptedFileBuffer: ArrayBuffer;
}) => {
  try {
    const decryptedFile = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: x.initializationVector },
      x.encryptionKey,
      x.encryptedFileBuffer,
    );

    return { success: true, data: decryptedFile } as const;
  } catch (e) {
    const error = e as { message: string };
    return { success: false, error } as const;
  }
};

export const encryptFile = async (x: {
  initializationVector: Uint8Array;
  encryptionKey: CryptoKey;
  unencryptedFileBuffer: ArrayBuffer;
}) => {
  try {
    const encryptedFile = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: x.initializationVector },
      x.encryptionKey,
      x.unencryptedFileBuffer,
    );
    return { success: true, data: encryptedFile } as const;
  } catch (e) {
    const error = e as { message: string };
    return { success: false, error } as const;
  }
};

export const serializeUInt8Array = (arr: Uint8Array) => {
  const serialized = btoa(String.fromCharCode(...Array.from(arr)));
  return serialized;
};

export const deserializeUInt8Array = (str: string) => {
  try {
    const decodedString = atob(str);

    const deserializedArray = new Uint8Array(decodedString.length);
    for (let i = 0; i < decodedString.length; i++) {
      deserializedArray[i] = decodedString.charCodeAt(i);
    }

    return { success: true, data: deserializedArray } as const;
  } catch (e) {
    const error = e as { message: string };
    return { success: false, error } as const;
  }
};
