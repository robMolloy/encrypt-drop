import { filesSchema } from "@/db/firestoreFilesSdk";
import { Unsubscribe } from "firebase/firestore";
import { z } from "zod";
import { create } from "zustand";

type TFilesState = {
  files: undefined | z.infer<typeof filesSchema>;
  getFiles: () => undefined | z.infer<typeof filesSchema>;
  setFiles: (x: undefined | z.infer<typeof filesSchema>) => void;
  listeners: Unsubscribe[];
  getListeners: () => Unsubscribe[];
  setListeners: (x: Unsubscribe[]) => void;
};

const useFilesStoreBase = create<TFilesState>()((set, get) => ({
  files: undefined,
  getFiles: () => get().files,
  setFiles: (files) => set(() => ({ files })),
  listeners: [],
  getListeners: () => get().listeners,
  setListeners: (listeners) => set(() => ({ listeners })),
}));

export const useFilesStore = () => {
  const filesStoreBase = useFilesStoreBase();
  const files = filesStoreBase.files;

  return {
    ...filesStoreBase,
    getSafeStore: () => {
      if (files === undefined) return { status: "invalid" } as const;
      return { status: "valid", files } as const;
    },
    clear: () => {
      if (filesStoreBase.listeners) filesStoreBase.listeners.forEach((x) => x());
      filesStoreBase.setFiles(undefined);
      filesStoreBase.setListeners([]);
    },
    addListener: (listener: Unsubscribe) => {
      filesStoreBase.setListeners([...filesStoreBase.getListeners(), listener]);
    },
  };
};
