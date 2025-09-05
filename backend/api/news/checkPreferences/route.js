import { Router } from "express";
import dbConnect from "../../../../src/lib/dBconnect.js";
import { NewsCache } from "../../../../src/lib/models/NewsCache.js";
import UserProfile from "../../../../src/lib/models/UserProfile.js";

const router = Router();

// ✅ GET /api/news-preferences?email=someone@example.com
router.get("/", async (req, res) => {
  try {
    const email = req.query.email?.toLowerCase();

    if (!email) {
      return res.status(200).json({ hasPreferences: false });
    }

    await dbConnect();

    const user = await UserProfile.findOne({ email });

    const hasPreferences = user?.newsPreferences?.length > 0;

    return res.status(200).json({ hasPreferences });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;


// import { NextResponse } from "next/server";
// import dbConnect from "../../../src/lib/dBconnect";
// import { NewsCache } from "../../../src/lib/models/NewsCache";
// import UserProfile from "../../../src/lib/models/UserProfile";


// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const email = searchParams.get("email");

//   if (!email) return NextResponse.json({ hasPreferences: false });

//   await dbConnect();

//   const user = await UserProfile.findOne({ email });

//   const hasPreferences = user?.newsPreferences?.length > 0;

//   return NextResponse.json({ hasPreferences });
// }
