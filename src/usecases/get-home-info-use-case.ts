import type {
  HomeInfoDay,
  HomeInfoDayStatus,
} from "../schemas/home-info.schemas.js";

interface InputDTO {
  userId: string;
}

interface OutputDTO {
  weekConsistency: {
    day: HomeInfoDay;
    status: HomeInfoDayStatus;
  }[];
  fireSequence: number;
  todayWorkoutDay: {
    date: string;
    name: string;
    estimatedDurationInSeconds: number;
    numberOfExercises: number;
    coverImageUrl: string | null;
    isCompleted: boolean;
    workoutPlanId: string;
    workoutDayId: string;
  } | null;
}

export interface IHomeInfoRepository {
  findByUserId(input: InputDTO): Promise<OutputDTO>;
}

export class GetHomeInfoUseCase {
  constructor(private readonly homeInfoRepository: IHomeInfoRepository) {}

  async execute(input: InputDTO): Promise<OutputDTO> {
    return this.homeInfoRepository.findByUserId(input);
  }
}

export type { HomeInfoDay, HomeInfoDayStatus, InputDTO, OutputDTO };
