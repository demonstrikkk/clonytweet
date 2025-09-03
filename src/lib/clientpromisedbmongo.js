// lib/mongodb.js
import { MongoClient } from "mongodb";



const uri = import.meta.env.VITE_MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env as VITE_MONGODB_URI");
}

if (import.meta.env.DEV) {
  // In dev, use a global variable so we don’t create multiple clients
  if (!globalThis._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalThis._mongoClientPromise = client.connect();
  }
  clientPromise = globalThis._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
