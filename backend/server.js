import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// Auto-load all routes from routes/ (so you don’t type 100 manually)
const routesPath = path.join(process.cwd(), "routes");

function loadRoutes(dir, baseRoute = "") {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadRoutes(fullPath, `${baseRoute}/${file}`);
    } else if (file.endsWith(".js")) {
      import(fullPath).then((module) => {
        const routePath = `${baseRoute}/${file.replace(".js", "")}`;
        app.use(`/api${routePath}`, module.default);
        console.log(`Loaded route: /api${routePath}`);
      });
    }
  });
}

loadRoutes(routesPath);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
