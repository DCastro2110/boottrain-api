import type {
  IUserData,
  IUserRepository,
  UpdateUserDataInput,
} from "../domain/user.js";
import prisma from "../lib/db.js";
import type { tx } from "../types/utils.js";

export class UserRepository implements IUserRepository {
  private prismaClient = prisma;

  async findById(id: string, tx?: tx): Promise<IUserData | null> {
    const client = tx ?? this.prismaClient;

    const user = await client.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return null;
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

  async update(
    id: string,
    data: UpdateUserDataInput,
    tx?: tx,
  ): Promise<{ id: string }> {
    const client = tx ?? this.prismaClient;

    const updateData: {
      name?: string | null;
      height?: number | null;
      weight?: number | null;
      age?: number | null;
      fitnessLevel?: "beginner" | "intermediate" | "advanced" | null;
      bodyFatPercentage?: number | null;
      image?: string | null;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.height !== undefined) {
      updateData.height = data.height;
    }
    if (data.weight !== undefined) {
      updateData.weight = data.weight;
    }
    if (data.age !== undefined) {
      updateData.age = data.age;
    }
    if (data.fitnessLevel !== undefined) {
      updateData.fitnessLevel = data.fitnessLevel;
    }
    if (data.bodyFatPercentage !== undefined) {
      updateData.bodyFatPercentage = data.bodyFatPercentage;
    }
    if (data.image !== undefined) {
      updateData.image = data.image;
    }

    await client.user.update({
      where: {
        id,
      },
      data: updateData,
    });

    return { id };
  }
}
