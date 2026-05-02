// before any other imports — ensures env() succeeds on first call
process.env.MONGODB_URI ||= "mongodb://localhost/test";
process.env.BETTERAUTH_SECRET ||= "x".repeat(32);
process.env.BETTERAUTH_URL ||= "http://localhost:3000";
process.env.GOOGLE_OAUTH_CLIENT_ID ||= "test";
process.env.GOOGLE_OAUTH_CLIENT_SECRET ||= "test";
process.env.NEXT_PUBLIC_GMAPS_KEY ||= "test";
process.env.GOOGLE_PLACES_KEY ||= "test";
process.env.GRAPHHOPPER_KEY ||= "test";
process.env.MAPBOX_KEY ||= "test";
process.env.REDIS_URL ||= "redis://localhost:6379";
// NODE_ENV is read-only in @types/node when narrowed; cast through writable record
(process.env as Record<string, string>).NODE_ENV ||= "test";

import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const handlers: Parameters<typeof setupServer>[number][] = [];
export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

export { http, HttpResponse };
