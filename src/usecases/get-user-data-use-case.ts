import type { IUserRepository } from "../domain/user.js";
import { NotFoundError } from "../errors/errors.js";

interface InputDTO {
  userId: string;
}

interface OutputDTO {
  id: string;
  email: string;
  name: string | null;
  height: number | null;
  weight: number | null;
  age: number | null;
  fitnessLevel: "beginner" | "intermediate" | "advanced" | null;
  bodyFatPercentage: number | null;
  image: string | null;
}

export interface IGetUserDataUseCase {
  execute(input: InputDTO): Promise<OutputDTO>;
}

export class GetUserDataUseCase implements IGetUserDataUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: InputDTO): Promise<OutputDTO> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      height: user.height,
      weight: user.weight,
      age: user.age,
      fitnessLevel: user.fitnessLevel,
      bodyFatPercentage: user.bodyFatPercentage,
      image: user.image,
    };
  }
}
