export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export interface IUserData {
  id: string;
  email: string;
  name?: string | null | undefined;
  height?: number | null | undefined;
  weight?: number | null | undefined;
  age?: number | null | undefined;
  fitnessLevel?: FitnessLevel | null | undefined;
  bodyFatPercentage?: number | null | undefined;
  image?: string | null | undefined;
}

export type UpdateUserDataInput = Omit<IUserData, "id" | "email">;

export interface IUserRepository {
  findById(id: string): Promise<IUserData | null>;
  update(id: string, data: UpdateUserDataInput): Promise<{ id: string }>;
}
