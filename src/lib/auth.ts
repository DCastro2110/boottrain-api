import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getOAuthState } from "better-auth/api";
import { openAPI } from "better-auth/plugins";

import prisma from "./db.js";

export const auth = betterAuth({
  baseUrl: process.env.BETTER_AUTH_URL!,
  trustedOrigins: ["http://localhost:3000"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    additionalFields: {
      timezone: {
        type: "string",
        required: false,
        defaultValue: "America/Sao_Paulo",
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session, ctx) => {
          if (ctx?.path === "/callback/:id") {
            const additionalData = await getOAuthState();

            if (additionalData?.timezone) {
              return {
                data: {
                  timezone: additionalData.timezone,
                },
              };
            }
          }
        },
      },
    },
  },
  plugins: [openAPI()],
});
