import type { FitnessLevel, IUserRepository } from "../domain/user.js";
import { NotFoundError } from "../errors/errors.js";

interface InputDTO {
  userId: string;
  name?: string | null;
  height?: number | null;
  weight?: number | null;
  age?: number | null;
  fitnessLevel?: FitnessLevel | null;
  bodyFatPercentage?: number | null;
  image?: string | null;
}

interface OutputDTO {
  userId: string;
}

export interface IUpdateUserDataUseCase {
  execute(input: InputDTO): Promise<OutputDTO>;
}

export class UpdateUserDataUseCase implements IUpdateUserDataUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: InputDTO): Promise<OutputDTO> {
    const hasDataToUpdate =
      input.name !== undefined ||
      input.height !== undefined ||
      input.weight !== undefined ||
      input.age !== undefined ||
      input.fitnessLevel !== undefined ||
      input.bodyFatPercentage !== undefined ||
      input.image !== undefined;

    if (!hasDataToUpdate) {
      return { userId: input.userId };
    }

    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.height !== undefined) updateData.height = input.height;
    if (input.weight !== undefined) updateData.weight = input.weight;
    if (input.age !== undefined) updateData.age = input.age;
    if (input.fitnessLevel !== undefined)
      updateData.fitnessLevel = input.fitnessLevel;
    if (input.bodyFatPercentage !== undefined)
      updateData.bodyFatPercentage = input.bodyFatPercentage;
    if (input.image !== undefined) updateData.image = input.image;

    await this.userRepository.update(input.userId, updateData);

    return {
      userId: input.userId,
    };
  }
}