/* eslint-disable no-undef */
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "dotenv/config"; // loads .env automatically

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Allow all origins, all methods, all headers
app.use(cors());
app.options("*", cors()); // Handle preflight requests

app.use(express.json());

// Path to your "api" folder
const routesPath = path.join(__dirname, "api");

function loadRoutes(dir, baseRoute = "") {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadRoutes(fullPath, `${baseRoute}/${file}`);
    } else if (file === "route.js") {
      import(pathToFileURL(fullPath).href)
        .then((module) => {
          const route = module.default;
          const routePath = baseRoute || "/";

          if (!route || typeof route !== "function") {
            console.warn(`⚠️ Route at ${fullPath} is not a valid Express router`);
            return;
          }

          app.use(`/api${routePath}`, route);
          console.log(`✅ Loaded route: /api${routePath}`);
        })
        .catch((err) => {
          console.error(`❌ Failed to load route at ${fullPath}:`, err);
        });
    }
  });
}

// Load all routes
loadRoutes(routesPath);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Backend running on port ${PORT}`)
);



// /* eslint-disable no-undef */
// import express from "express";
// import cors from "cors";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath, pathToFileURL } from "url";
// import 'dotenv/config'; // loads .env automatically

// // ESM __dirname fix
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// app.use(cors({
//   origin:   'http://localhost:5173', // your frontend URL
//   methods: ['GET','POST','PUT','DELETE'], // allowed HTTP methods
//   credentials: true // if you want to allow cookies or auth headers
// }));
// app.use(express.json());

// // Path to your "api" folder
// const routesPath = path.join(__dirname, "api");

// function loadRoutes(dir, baseRoute = "") {
//   fs.readdirSync(dir).forEach((file) => {
//     const fullPath = path.join(dir, file);
//     const stat = fs.statSync(fullPath);

//     if (stat.isDirectory()) {
//       loadRoutes(fullPath, `${baseRoute}/${file}`);
//     } else if (file === "route.js") {
//       import(pathToFileURL(fullPath).href)
//         .then((module) => {
//           const route = module.default;
//           const routePath = baseRoute || "/";

//           if (!route || typeof route !== "function") {
//             console.warn(`⚠️ Route at ${fullPath} is not a valid Express router`);
//             return;
//           }

//           app.use(`/api${routePath}`, route);
//           console.log(`✅ Loaded route: /api${routePath}`);
//         })
//         .catch((err) => {
//           console.error(`❌ Failed to load route at ${fullPath}:`, err);
//         });
//     }
//   });
// }

// // Load all routes
// loadRoutes(routesPath);

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
