import { Router } from "express";
import { getNews } from "../fetchGuardian.js"; // adjust path if needed

const router = Router();

// ✅ GET /api/news?tag=xyz
router.get("/", async (req, res) => {
  const { tag } = req.query;

  if (!tag) {
    return res.status(400).json({ success: false, message: "Tag is required" });
  }

  try {
    const articles = await getNews(tag);
    return res.status(200).json(articles); // ✅ just return array
  } catch (error) {
    console.error("Error fetching news:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch news" });
  }
});

export default router;




// import { NextResponse } from "next/server";
// import { getNews } from "../fetchGuardian";


// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const tag = searchParams.get("tag");
//   if (!tag) {
//     return NextResponse.json({ success: false, message: "Tag is required" }, { status: 400 });
//   }

//   try {
//     const articles = await getNews(tag);
//     return NextResponse.json(articles); // ✅ just return array

// } catch (error) {
//     return NextResponse.json({ success: false, message: "Failed to fetch news" }, { status: 500 });
//   }
// }
