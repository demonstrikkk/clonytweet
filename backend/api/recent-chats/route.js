import dbConnect from "../../src/lib/dBconnect";
import UserProfile from "../../src/lib/models/UserProfile";


export async function POST(req) {
  try {
    const { peers } = await req.json();
    await dbConnect();
    const profiles = await UserProfile.find({ email: { $in: peers } }).lean();
    return Response.json(profiles);
  } catch (err) {
    return Response.json([], { status: 500 });
  }
}
