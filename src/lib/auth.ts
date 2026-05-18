import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getOAuthState } from "better-auth/api";
import { openAPI } from "better-auth/plugins";

import prisma from "./db.js";

console.log(process.env.CLIENT_URL);

export const auth = betterAuth({
  baseUrl: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [process.env.CLIENT_URL!],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  rateLimit: {
    customRules: {
      "/sign-in/**": {
        window: 60,
        max: 5,
      },
      "/sign-up/**": {
        window: 60,
        max: 3,
      },
    },
  },
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
  user: {
    additionalFields: {
      weight: {
        type: "number",
        required: false,
        returned: true,
      },
      height: {
        type: "number",
        required: false,
        returned: true,
      },
      age: {
        type: "number",
        required: false,
        returned: true,
      },
      fitnessLevel: {
        type: "string",
        required: false,
        returned: true,
      },
      bodyFatPercentage: {
        type: "number",
        required: false,
        returned: true,
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
