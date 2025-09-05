import { Router } from "express";
import dbConnect from "../../../../src/lib/dBconnect.js";
import UserProfile from "../../../../src/lib/models/UserProfile.js";

const router = Router();

// ✅ POST /api/user/preferences
router.post("/", async (req, res) => {
  try {
    const { email, preferences } = req.body;

    // 🛑 Validation
    if (!email || !Array.isArray(preferences)) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    if (preferences.length > 3) {
      return res.status(400).json({ success: false, message: "Maximum 3 preferences allowed" });
    }

    await dbConnect();

    // 🔄 Update user profile with preferences
    const updated = await UserProfile.findOneAndUpdate(
      { email: email.toLowerCase() },
      { newsPreferences: preferences },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating preferences:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;






// import { NextResponse } from "next/server";
// import dbConnect from "../../../src/lib/dBconnect";
// import UserProfile from "../../../src/lib/models/UserProfile";



// export async function POST(req) {
//   try {
//     const { email, preferences } = await req.json();

//     // 🛑 Validation
//     if (!email || !Array.isArray(preferences)) {
//       return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
//     }

//     if (preferences.length > 3) {
//       return NextResponse.json({ success: false, message: "Maximum 3 preferences allowed" }, { status: 400 });
//     }

//     await dbConnect();


//     // 🔄 Update user profile with preferences
//     const updated = await UserProfile.findOneAndUpdate(
//       { email: email.toLowerCase() },
//       { newsPreferences: preferences },
//       { new: true }
//     );

//     if (!updated) {
//       return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
//     }


//     return NextResponse.json({ success: true });

//   } catch (err) {
//     return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
//   }
// }
