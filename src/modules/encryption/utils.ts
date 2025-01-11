export const generateInitializationVector = async () => {
  return window.crypto.getRandomValues(new Uint8Array(12));
};

export const deriveEncryptionKey = async (x: { password: string; salt?: Uint8Array }) => {
  const salt = x.salt ? x.salt : crypto.getRandomValues(new Uint8Array(16));

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(x.password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
};

// const generateEncryptionKey = async () => {
//   return window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
//     "encrypt",
//     "decrypt",
//   ]);
// };

export const decryptFile = async (x: {
  initializationVector: Uint8Array;
  encryptionKey: CryptoKey;
  encryptedFileBuffer: ArrayBuffer;
}) => {
  return window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: x.initializationVector },
    x.encryptionKey,
    x.encryptedFileBuffer,
  );
};

export const encryptFile = async (x: {
  initializationVector: Uint8Array;
  encryptionKey: CryptoKey;
  unencryptedFileBuffer: ArrayBuffer;
}) => {
  return window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: x.initializationVector },
    x.encryptionKey,
    x.unencryptedFileBuffer,
  );
};
