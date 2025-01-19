import { fileSchema } from "@/db/firestoreFilesSdk";
import { Unsubscribe } from "firebase/firestore";
import { z } from "zod";
import { create } from "zustand";

type TFilesState = {
  docs: z.infer<typeof fileSchema>[];
  getDocs: () => z.infer<typeof fileSchema>[];
  setDocs: (x: z.infer<typeof fileSchema>[]) => void;
  listeners: Unsubscribe[];
  getListeners: () => Unsubscribe[];
  setListeners: (x: Unsubscribe[]) => void;
};

const useFilesStoreBase = create<TFilesState>()((set, get) => ({
  docs: [],
  getDocs: () => get().docs,
  setDocs: (files) => set(() => ({ docs: files })),
  listeners: [],
  getListeners: () => get().listeners,
  setListeners: (listeners) => set(() => ({ listeners })),
}));

export const useFilesStore = () => {
  const filesStoreBase = useFilesStoreBase();
  const files = filesStoreBase.docs;

  return {
    ...filesStoreBase,
    getSafeStore: () => {
      if (files === undefined) return { status: "invalid" } as const;
      return { status: "valid", files } as const;
    },
    clear: () => {
      if (filesStoreBase.listeners) filesStoreBase.listeners.forEach((x) => x());
      filesStoreBase.setDocs([]);
      filesStoreBase.setListeners([]);
    },
    addListener: (listener: Unsubscribe) => {
      filesStoreBase.setListeners([...filesStoreBase.getListeners(), listener]);
    },
  };
};
