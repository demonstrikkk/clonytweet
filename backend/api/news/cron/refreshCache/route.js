import { Router } from "express";
import { getNews } from "../../fetchGuardian.js";

const router = Router();

// ✅ categories to refresh (except personalized)
const categoriesToRefresh = ["general", "sports", "trending", "entertainment"];

router.get("/", async (req, res) => {
  try {
    // Refresh categories in parallel
    await Promise.all(categoriesToRefresh.map((cat) => getNews(cat)));

    // Optionally: refresh personalized for some users here or trigger via frontend

    return res.status(200).json({
      success: true,
      message: "Cache refreshed",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Cache refresh failed",
    });
  }
});

export default router;



// import { getNews } from "../../fetchGuardian";


// // Define your categories to refresh (except personalized)
// const categoriesToRefresh = ["general", "sports", "trending", "entertainment"];

// export async function GET() {
//   try {
//     // Refresh categories in parallel
//     await Promise.all(categoriesToRefresh.map((cat) => getNews(cat)));

//     // Optionally: refresh personalized for some users here or trigger via frontend

//     return new Response(JSON.stringify({ success: true, message: "Cache refreshed" }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (err) {
//     return new Response(JSON.stringify({ success: false, message: "Cache refresh failed" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }
