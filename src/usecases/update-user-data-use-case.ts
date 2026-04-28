import type { FitnessLevel, IUserRepository } from "../domain/user.js";
import { NotFoundError } from "../errors/errors.js";

interface InputDTO {
  userId: string;
  name?: string | null | undefined;
  height?: number | null | undefined;
  weight?: number | null | undefined;
  age?: number | null | undefined;
  fitnessLevel?: FitnessLevel | null | undefined;
  bodyFatPercentage?: number | null | undefined;
  image?: string | null | undefined;
}

interface OutputDTO {
  userId: string;
}

export interface IUpdateUserDataUseCase {
  execute(input: InputDTO): Promise<OutputDTO>;
}

const FIELDS: (keyof InputDTO)[] = [
  "name",
  "height",
  "weight",
  "age",
  "fitnessLevel",
  "bodyFatPercentage",
  "image",
];

export class UpdateUserDataUseCase implements IUpdateUserDataUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: InputDTO): Promise<OutputDTO> {
    let hasDataToUpdate = false;
    const updateData: Partial<InputDTO> = { ...input };

    for (const rawKey in Object.keys(input)) {
      const key = rawKey as keyof InputDTO;
      const value = input[key];
      if (
        !FIELDS.includes(key) ||
        value === undefined ||
        value === null ||
        (typeof value === "string" ? value.trim() === "" : false)
      ) {
        hasDataToUpdate = true;
        delete updateData[key];
      }
    }

    if (!hasDataToUpdate) {
      return { userId: input.userId };
    }

    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await this.userRepository.update(input.userId, updateData);

    return {
      userId: input.userId,
    };
  }
}
