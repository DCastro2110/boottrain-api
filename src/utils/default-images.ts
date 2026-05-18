/**
 * Centralized default image URLs for workout day cover images.
 * Maps training categories to their respective default image URLs.
 */
export const DEFAULT_WORKOUT_IMAGES = {
  upperBody: [
    "https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v",
    "https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOW3fJmqZe4yoUcwvRPQa8kmFprzNiC30hqftL",
  ],
  lowerBody: [
    "https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgCHaUgNGronCvXmSzAMs1N3KgLdE5yHT6Ykj",
    "https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO85RVu3morROwZk5NPhs1jzH7X8TyEvLUCGxY",
  ],
  cardio: [
    "https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v",
    "https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOW3fJmqZe4yoUcwvRPQa8kmFprzNiC30hqftL",
  ],
  abdomen: [
    "https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgCHaUgNGronCvXmSzAMs1N3KgLdE5yHT6Ykj",
    "https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO85RVu3morROwZk5NPhs1jzH7X8TyEvLUCGxY",
  ],
} as const;

/**
 * Training categories supported for default workout images.
 */
export type WorkoutImageCategory = keyof typeof DEFAULT_WORKOUT_IMAGES;

/**
 * Get a default image URL for a given training category.
 * Cycles through available URLs based on the index to provide variety.
 */
export function getDefaultWorkoutImageUrl(
  category: WorkoutImageCategory,
  index: number = 0,
): string {
  const urls = DEFAULT_WORKOUT_IMAGES[category];
  return urls[index % urls.length] ?? urls[0]!;
}