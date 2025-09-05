import { Router } from "express";
import { getNews } from "../fetchGuardian.js"; // adjust path if needed

const router = Router();

// ✅ GET /api/news/personalized?email=xyz
router.get("/", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const articles = await getNews("personalized", email);
    return res.status(200).json(articles); // ✅ just return array
  } catch (error) {
    console.error("Error fetching personalized news:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch personalized news" });
  }
});

export default router;



// import { NextResponse } from "next/server";
// import { getNews } from "../fetchGuardian";


// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const email = searchParams.get("email");
//   if (!email) {
//     return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
//   }

//   try {
//     const articles = await getNews("personalized", email);
//     return NextResponse.json(articles );
//   } catch (error) {
//     return NextResponse.json({ success: false, message: "Failed to fetch personalized news" }, { status: 500 });
//   }
// }
