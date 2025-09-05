import { Router } from "express";
import { getNews } from "../fetchGuardian.js"; // update path if needed

const router = Router();

// ✅ GET /api/news?tag=politics&userEmail=someone@example.com
router.get("/", async (req, res) => {
  try {
    const tag = req.query.tag;
    const userEmail = req.query.userEmail; // optional

    if (!tag) {
      return res.status(400).json({ success: false, message: "Tag is required" });
    }

    const articles = await getNews(tag, userEmail);
    return res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching news:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch news" });
  }
});

export default router;



// import { NextResponse } from "next/server";
// import { getNews } from "../fetchGuardian"; // update path if your file is elsewhere


// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const tag = searchParams.get("tag");
//   const userEmail = searchParams.get("userEmail"); // optional for personalized

//   if (!tag) {
//     return NextResponse.json({ success: false, message: "Tag is required" }, { status: 400 });
//   }

//   try {
//     const articles = await getNews(tag, userEmail);
//     return NextResponse.json(articles);
//   } catch (error) {
//     return NextResponse.json({ success: false, message: "Failed to fetch news" }, { status: 500 });
//   }
// }
