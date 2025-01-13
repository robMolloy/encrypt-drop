import { z } from "zod";
import { createSafeSdk, timestampSchema } from "@/utils/firestoreSdkUtils/firestoreSdkUtils";

const filesCollectionName = "files";

const filesSchema = z.object({
  id: z.string(),
  uid: z.string(),
  name: z.string(),
  serializedEncryptionKeySalt: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const filesSdk = createSafeSdk({
  collectionName: filesCollectionName,
  schema: filesSchema,
});
