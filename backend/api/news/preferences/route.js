import { Router } from "express";
import dbConnect from "../../../../src/lib/dBconnect.js";
import UserProfile from "../../../../src/lib/models/UserProfile.js";

const router = Router();

// ✅ GET /api/user/preferences?email=abc@example.com
router.get("/", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    await dbConnect();
    const user = await UserProfile.findOne({ email });

    return res.status(200).json({
      preferences: user?.newsPreferences || [],
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch preferences" });
  }
});

export default router;



// import { NextResponse } from "next/server";
// import dbConnect from "../../../../src/lib/dBconnect";
// import UserProfile from "../../../../src/lib/models/UserProfile";


// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const email = searchParams.get("email");
//   if (!email) return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });

//   await dbConnect();
//   const user = await UserProfile.findOne({ email });
//   return NextResponse.json({ preferences: user?.newsPreferences || [] });
// }
