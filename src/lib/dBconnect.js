


// // lib/dbConnect.js

// import mongoose from 'mongoose';

// const MONGODB_URI = import.meta.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable');
// }

// let cached = global._mongoose;

// export default async function dbConnect() {
//   if (cached.conn) return cached.conn;

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//     };

//     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// // export default dbConnect;








import mongoose from 'mongoose';


const MONGODB_URI = import.meta.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Initialize global._mongoose if it doesn't exist
if (!globalThis._mongoose) {
  globalThis._mongoose = { conn: null, promise: null };
}

let cached = globalThis._mongoose;

export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // add any other options you need here
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
