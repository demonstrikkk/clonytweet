import { Router } from "express";
import dbConnect from "../../../src/lib/dBconnect.js";
import UserProfile from "../../../src/lib/models/UserProfile.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: "Invalid input: emails array is required" });
    }

    await dbConnect();

    const profiles = await UserProfile.find({
      email: { $in: emails }
    }).lean();

    return res.status(200).json(profiles);
  } catch (err) {
    console.error("Fetch profiles error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;



// import dbConnect from "../../src/lib/dBconnect";
// import UserProfile from "../../src/lib/models/UserProfile";


// export async function POST(req) {
//   try {
//     const { emails } = await req.json();
//     await dbConnect();

//     const profiles = await UserProfile.find({
//       email: { $in: emails }
//     }).lean();

//     return new Response(JSON.stringify(profiles), { status: 200 });
//   } catch (err) {
//     return new Response("Server error", { status: 500 });
//   }
// }
