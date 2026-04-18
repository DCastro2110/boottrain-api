import type { DefaultArgs } from "@prisma/client/runtime/client";

import type { PrismaClient } from "../../generated/prisma/client.js";

export type tx = Omit<
  PrismaClient<never, undefined, DefaultArgs>,
  "$connect" | "$disconnect" | "$on" | "$use" | "$extends"
>;
