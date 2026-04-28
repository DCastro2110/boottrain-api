export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export interface IUserData {
  id: string;
  email: string;
  name: string | null;
  height: number | null;
  weight: number | null;
  age: number | null;
  fitnessLevel: FitnessLevel | null;
  bodyFatPercentage: number | null;
  image: string | null;
}

export type UpdateUserDataInput = Omit<IUserData, "id" | "email">;

export interface IUserRepository {
  findById(id: string): Promise<IUserData | null>;
  update(
    id: string,
    data: Partial<UpdateUserDataInput>,
  ): Promise<{ id: string }>;
}
