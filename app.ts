import express, { Request, Response, NextFunction } from "express";
import "dotenv/config";
import router from "./src/routes/api.js";
import cookieParser from "cookie-parser";

// Security Middleware bib Import
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import { xss } from "express-xss-sanitizer";
import cors from "cors";
import { ensureTablesExist } from "./src/utils/supabase/supabaseSchemaSetup.js";

const app = express();

ensureTablesExist();

// Security Middleware Implement
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Credentials", true + "");
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(helmet());
app.use(xss());
app.use(hpp());

// Body Parser Implement
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Request Rate Limit
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3000 });
app.use(limiter);

// Routing Implement
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

// undefiend Route Implement
app.use(/.*/, (req: Request, res: Response) => {
  res.status(404).json({ status: "fail", data: "Not Found" });
});

export default app;
