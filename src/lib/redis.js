
import Redis from 'ioredis';



const redis = new Redis(import.meta.env.REDIS_URL);


export default redis;
