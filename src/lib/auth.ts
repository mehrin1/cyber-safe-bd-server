import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const appURL = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [appURL],
  secret: process.env.BETTER_AUTH_SECRET,
  // OAuth callbacks use the browser origin and are proxied to this API by Next.js.
  baseURL: appURL,
  advanced: {
    cookiePrefix: "cybersafebd",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            redirectURI: `${appURL}/api/auth/callback/google`,
          },
        }
      : {},
});
