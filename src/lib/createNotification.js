import { Notification } from "./models/Notification.js";
import dbConnect from "./dBconnect.js";




export  async function createNotification({ userEmail, fromUserEmail, type, postId = null }) {



try {
    await dbConnect();
    if (userEmail === fromUserEmail) return;
    await Notification.create({
      userEmail,
      fromUserEmail,
      type,
      postId,
    });
  } catch (err) {
    console.error('this is fishy', err);
  }

}
