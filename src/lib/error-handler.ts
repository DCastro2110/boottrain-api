import type { FastifyInstance } from "fastify";
import z, { ZodError } from "zod";

const ERROR_STATUS_MAP: Record<string, number> = {
  NotFoundError: 404,
  UnauthorizedError: 401,
  ForbiddenError: 403,
  BadRequestError: 400,
  ConflictError: 409,
  StreamInProgressError: 409,
  RedisError: 503,
  InternalServerError: 500,
};

export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}

export function formatFastifyError(
  error: unknown,
): ErrorResponse & { status: number } {
  if (error instanceof ZodError) {
    return {
      status: 400,
      error: "Validation Error",
      code: "VALIDATION_ERROR",
      details: (error as unknown as { issues: z.core.$ZodIssue[] }).issues.map(
        (e) => ({
          path: e.path.join("."),
          message: e.message,
        }),
      ),
    };
  }

  if (error instanceof Error) {
    const status = ERROR_STATUS_MAP[error.name] ?? 500;
    const message = error.message || "An unexpected error occurred";
    const code = (error as { code?: string }).code ?? error.name;

    return { status, error: message, code };
  }

  return {
    status: 500,
    error: "An unexpected error occurred",
    code: "INTERNAL_SERVER_ERROR",
  };
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    const { status, error: message, code, details } = formatFastifyError(error);

    if (status > 500) {
      request.log.error(error);
    }

    if (status === 401 || status === 403) {
      request.log.warn({ ip: request.ip, path: request.url }, "Auth failure");
    }

    return reply.status(status).send({
      error: message,
      code,
      ...(details !== undefined && { details }),
    });
  });
}
