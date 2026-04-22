# Refactor Structure

## Goal

Refactor the structure of the codebase to improve maintainability and scalability.

## Technical requirements:

- create a new folder called `db` in the `src` folder. This folder should contain all prisma repositories.
- Inside of files of `src/domain` folder, you should create a repository interface for each entity that you need to access the database. For example, if you have a `User` entity, you should create a `UserRepository` interface with the methods that you need to access the database for the `User` entity.
- Remove the `repositories` folder and move all the files inside of it to the `db` folder. You should also update the imports in the files that were using the repositories to import from the new location.
- Remove repository interface from the each use case and put together with the domain in the same file. For example, if you have a `CreateUser` use case, you should move the `UserRepository` interface to the file `user.ts` in the `src/domain` folder.
- All files should be named in kebab-case. For example, if you have a file called `CreateUser.ts`, you should rename it to `create-user.ts`.
- All folders should be named in kebab-case. For example, if you have a folder called `User`, you should rename it to `user`.
- Update all imports to reflect the new structure.
