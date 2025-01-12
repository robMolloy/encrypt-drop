import { z } from "zod";
import { createSafeSdk } from "./firestoreSdkUtils";

const filesCollectionName = "files";
const filesSchema = z.object({
  id: z.string(),
  name: z.string(),
  serializedEncryptionKeySalt: z.string(),
  updatedAt: z.string(),
  createdAt: z.string(),
});

export const filesSdk = createSafeSdk({
  collectionName: filesCollectionName,
  schema: filesSchema,
});
