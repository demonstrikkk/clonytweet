 import redis from "./redis.js";

export async function invalidateCache(key) {
  try {
    await redis.del(key);
  } catch (err) {
    console.error("Cache invalidation error:", err);
  }
}




