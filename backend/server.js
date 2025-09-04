/* eslint-disable no-undef */
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Point to your "api" folder instead of "routes"
const routesPath = path.join(__dirname, "api");

function loadRoutes(dir, baseRoute = "") {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadRoutes(fullPath, `${baseRoute}/${file}`);
    } else if (file === "route.js") {
      // ✅ Import with file:// for ESM compatibility
      import(pathToFileURL(fullPath).href).then((module) => {
        const routePath = baseRoute || "/";
        app.use(`/api${routePath}`, module.default);
        console.log(`Loaded route: /api${routePath}`);
      });
    }
  });
}

loadRoutes(routesPath);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
