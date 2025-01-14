import { FirebaseStorage, ref, uploadBytes } from "firebase/storage";

export const uploadFileBlob = async (p: { storage: FirebaseStorage; id: string; blob: Blob }) => {
  try {
    const storageRef = ref(p.storage, `files/${p.id}`);
    const snapshot = await uploadBytes(storageRef, p.blob);
    return { success: true, data: snapshot } as const;
  } catch (e) {
    const error = e as { message: string };
    console.error(error);
    return { success: false, error } as const;
  }
};
