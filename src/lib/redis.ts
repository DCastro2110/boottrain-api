import { Redis } from "ioredis";

import { RedisError } from "../errors/errors.js";

let redisInstance: Redis | null = null;

// Função para obter a instância única (Singleton)
export function getRedisClient(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(process.env.REDIS_URL!, {
      retryStrategy(times) {
        return Math.min(times * 50, 2000);
      },
      maxRetriesPerRequest: null,
    });

    redisInstance.on("error", (error) => {
      console.error("🚨 [ioredis] Erro na conexão:", error.message);
    });

    redisInstance.on("connect", () => {
      console.log(
        "🔌 [ioredis] Uma única conexão com o Redis foi estabelecida.",
      );
    });
  }

  return redisInstance;
}

// Para manter compatibilidade com seu código antigo, exportamos o getter como 'redis'
// Mas agora encapsulado para evitar múltiplas criações
export const redis = getRedisClient();
export const REDIS_KEYS = {
  AI_STREAM_ACTIVE: "stream:active",
} as const;

export const REDIS_TTL = {
  AI_STREAM_ACTIVE: 120,
  CACHE: 3600,
} as const;

export async function setStreamActive(userId: string): Promise<void> {
  try {
    await redis.set(
      `${REDIS_KEYS.AI_STREAM_ACTIVE}:${userId}`,
      "1",
      "EX",
      REDIS_TTL.AI_STREAM_ACTIVE,
    );
  } catch {
    throw new RedisError("Failed to set stream active in Redis");
  }
}

export async function clearStreamActive(userId: string): Promise<void> {
  try {
    await redis.del(`${REDIS_KEYS.AI_STREAM_ACTIVE}:${userId}`);
  } catch {
    throw new RedisError("Failed to clear stream active in Redis");
  }
}

export async function isStreamActive(userId: string): Promise<boolean> {
  try {
    const result = await redis.get(`${REDIS_KEYS.AI_STREAM_ACTIVE}:${userId}`);
    return result === "1";
  } catch {
    throw new RedisError("Failed to check stream active in Redis");
  }
}
