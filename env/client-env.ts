import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_SERVER_URL: z.string().min(1),
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1).optional(),
    NEXT_PUBLIC_MAP_STYLE: z.string().min(1).optional(),
    NEXT_PUBLIC_R2_ENDPOINT: z.string().url().optional(),
    NEXT_PUBLIC_R2_ACCESS_KEY_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_R2_BUCKET_NAME: z.string().min(1).optional(),
    NEXT_PUBLIC_R2_PUBLIC_URL: z.string().url().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_MAP_STYLE: process.env.NEXT_PUBLIC_MAP_STYLE,
    NEXT_PUBLIC_R2_ENDPOINT: process.env.NEXT_PUBLIC_R2_ENDPOINT,
    NEXT_PUBLIC_R2_ACCESS_KEY_ID: process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID,
    NEXT_PUBLIC_R2_SECRET_ACCESS_KEY: process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY,
    NEXT_PUBLIC_R2_BUCKET_NAME: process.env.NEXT_PUBLIC_R2_BUCKET_NAME,
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
  },
});
