import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { env } from "@/lib/env";

const client = new MongoClient(env().MONGODB_URI);
const dbInstance = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(dbInstance),
  baseURL: env().BETTERAUTH_URL,
  secret: env().BETTERAUTH_SECRET,
  socialProviders: {
    google: {
      clientId: env().GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: env().GOOGLE_OAUTH_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      preferences: {
        type: "string", // stored as JSON string
        defaultValue: JSON.stringify({
          defaultMode: "walk",
          units: "metric",
          routePrefs: {
            preferFewerStairs: false,
            scenicRoute: false,
            avoidBusyRoads: false,
          },
        }),
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
