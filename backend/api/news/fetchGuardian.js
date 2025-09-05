/* eslint-disable no-undef */
import { CACHE_EXPIRY_HOURS_GENERAL, CACHE_EXPIRY_HOURS_PERSONALIZED } from "../../../src/lib/constants.js";
import dbConnect from "../../../src/lib/dBconnect.js";
import { NewsCache } from "../../../src/lib/models/NewsCache.js";
import UserProfile from "../../../src/lib/models/UserProfile.js";
import redis from "../../../src/lib/redis.js";

// ✅ Load API key from environment (Render will inject it)
const GUARDIAN_API_KEY = process.env.VITE_NEWS_API_KEY;

// Fetch fresh news from The Guardian API
async function fetchGuardianNews(tag, userEmail = null) {
  let url = `https://content.guardianapis.com/search?show-fields=thumbnail,headline,trailText,body&api-key=${GUARDIAN_API_KEY}`;

  if (userEmail) {
    // Personalized fetch logic — treat each tag as its own section
    url += `&section=${tag}`;
  } else {
    switch (tag) {
      case "general":
        url += `&section=news`;
        break;
      case "sports":
        url += `&section=sport`;
        break;
      case "trending":
        url += `&order-by=newest`;
        break;
      case "entertainment":
        url += `&section=film`;
        break;
      default:
        url += `&section=${tag}`;
        break;
    }
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch from Guardian API");

  const data = await res.json();

  return data.response.results.map((article) => ({
    id: article.id,
    webTitle: article.webTitle,
    thumbnail: article.fields?.thumbnail || null,
    trailText: article.fields?.trailText || null,
    body: article.fields?.body || null,
    webUrl: article.webUrl,
  }));
}

export async function getNews(tag, userEmail = null) {
  await dbConnect();

  const now = new Date();
  const redisKey = userEmail ? `news:${userEmail}:${tag}` : `news:general:${tag}`;

  // ✅ Step 1: Try Redis cache
  const redisCache = await redis.get(redisKey);
  if (redisCache) {
    return JSON.parse(redisCache);
  }

  // ✅ Step 2: Try MongoDB cache
  let cache =
    (await NewsCache.findOne({ tag, userEmail })) ||
    (userEmail ? await UserProfile.findOne({ email: userEmail, newsPreferences: tag }) : null);

  const expiryHours = userEmail ? CACHE_EXPIRY_HOURS_PERSONALIZED : CACHE_EXPIRY_HOURS_GENERAL;
  const isCacheValid = cache && (now - cache.fetchedAt) / (1000 * 60 * 60) < expiryHours;

  if (isCacheValid) {
    await redis.set(redisKey, JSON.stringify(cache.articles), "EX", expiryHours * 3600);
    return cache.articles;
  }

  // ✅ Step 3: Fetch from Guardian API
  const articles = await fetchGuardianNews(tag, userEmail);

  // ✅ Step 4: Save to MongoDB
  await NewsCache.findOneAndUpdate(
    { tag, userEmail },
    { articles, fetchedAt: now },
    { upsert: true }
  );

  // ✅ Step 5: Save to Redis
  await redis.set(redisKey, JSON.stringify(articles), "EX", expiryHours * 3600);

  return articles;
}



// import { CACHE_EXPIRY_HOURS_GENERAL, CACHE_EXPIRY_HOURS_PERSONALIZED } from "../lib/constants";
// import dbConnect from "../../../src/lib/dBconnect";
// import { NewsCache } from "../../../src/lib/models/NewsCache";
// import UserProfile from "../../../src/lib/models/UserProfile";
// import redis from "../../../src/lib/redis";
// const GUARDIAN_API_KEY = import.meta.env.VITE_NEWS_API_KEY;


// // Fetch fresh news from The Guardian API
// async function fetchGuardianNews(tag, userEmail = null) {
//   let url = `https://content.guardianapis.com/search?show-fields=thumbnail,headline,trailText,body&api-key=${GUARDIAN_API_KEY}`;

//   if (userEmail) {
//     // Personalized fetch logic — treat each tag as its own section
//     url += `&section=${tag}`;
//   } else {
//     switch (tag) {
//       case "general":
//         url += `&section=news`;
//         break;
//       case "sports":
//         url += `&section=sport`;
//         break;
//       case "trending":
//         url += `&order-by=newest`;
//         break;
//       case "entertainment":
//         url += `&section=film`;
//         break;
//       default:
//         url += `&section=${tag}`;
//         break;
//     }
//   }

//   const res = await fetch(url);
//   if (!res.ok) throw new Error("Failed to fetch from Guardian API");

//   const data = await res.json();

//   return data.response.results.map((article) => ({
//     id: article.id,
//     webTitle: article.webTitle,
//     thumbnail: article.fields?.thumbnail || null,
//     trailText: article.fields?.trailText || null,
//     body: article.fields?.body || null,
//     webUrl: article.webUrl,
//   }));
// }



// export async function getNews(tag, userEmail = null) {
//   await dbConnect();

//   const now = new Date();
//  const redisKey = userEmail ? `news:${userEmail}:${tag}` : `news:general:${tag}`;
//   // Step 1: Try cache
  
//    const redisCache = await redis.get(redisKey);
//   if (redisCache) {
//     return JSON.parse(redisCache); // Already stringified
//   }
  
  
//   let cache = await NewsCache.findOne({ tag, userEmail }) || await UserProfile.findOne({email:userEmail,newsPreferences:tag})

//   const expiryHours = userEmail ? CACHE_EXPIRY_HOURS_PERSONALIZED : CACHE_EXPIRY_HOURS_GENERAL;
//   const isCacheValid = cache && (now - cache.fetchedAt) / (1000 * 60 * 60) < expiryHours;

//   if (isCacheValid) {
//      await redis.set(redisKey, JSON.stringify(cache.articles), 'EX', expiryHours * 3600);
//     return cache.articles;
//   }

//   // Step 2: Fetch from Guardian
//   const articles = await fetchGuardianNews(tag, userEmail);

//   // Step 3: Save to MongoDB (insert or update)
//   await NewsCache.findOneAndUpdate(
//     { tag, userEmail },
//     { articles, fetchedAt: now },
//     { upsert: true }
//   );
// await redis.set(redisKey, JSON.stringify(articles), 'EX', expiryHours * 3600);
//   return articles;
// }
