import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";

import prisma from "./db.js";

export const auth = betterAuth({
  trustedOrigins: ["http://localhost:3001"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    additionalFields: {
      timezone: {
        type: "string",
        required: true,
      },
    },
  },
  plugins: [openAPI()],
});
