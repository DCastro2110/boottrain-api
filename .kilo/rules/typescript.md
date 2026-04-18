# TypeScript conventions

- Use ESM imports with explicit `.js` extension in local imports (required by `moduleResolution: nodenext` + `verbatimModuleSyntax`).
- **ALWAYS** create interface starting with "I", example: ICreateUserUseCase
- Prefer `import type` for types to keep runtime imports clean.
- Keep `strict` compatibility: avoid `any`; when unavoidable at boundaries, use `unknown` + narrow with Zod/type guards.
- Public methods (routes, use cases, repositories) should have explicit return types.
- Reuse shared transaction type `tx` from `src/types/utils.ts` for Prisma transaction-aware methods.
- Keep repository input types derived from interfaces when possible (`Parameters<Interface["method"]>[0]`) to avoid duplication drift.
- Sort imports/exports to satisfy ESLint `simple-import-sort`.
- Preserve naming consistency in DTO/domain fields (e.g. `estimatedDurationInSeconds`), do not introduce variant spellings.
- Validate HTTP payload structure in routes with Zod; keep business rules in use cases.
- Do not hand-edit `generated/prisma/*`; regenerate with Prisma commands.
