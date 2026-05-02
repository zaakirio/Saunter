import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  BETTERAUTH_SECRET: z.string().min(32),
  BETTERAUTH_URL: z.url(),
  GOOGLE_OAUTH_CLIENT_ID: z.string().min(1),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(1),
  NEXT_PUBLIC_GMAPS_KEY: z.string().min(1),
  GOOGLE_PLACES_KEY: z.string().min(1),
  GRAPHHOPPER_KEY: z.string().min(1),
  MAPBOX_KEY: z.string().min(1),
  REDIS_URL: z.string().min(1),
  DISCORD_WEBHOOK_URL: z.url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(input: NodeJS.ProcessEnv): Env {
  return envSchema.parse(input);
}

let cached: Env | undefined;
export function env(): Env {
  if (!cached) cached = parseEnv(process.env);
  return cached;
}
