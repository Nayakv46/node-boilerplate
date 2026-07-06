require("dotenv").config({ path: ".env" });
import express from "express";
import cors from "cors";
import router from "./routes/router";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/", (req: express.Request, res: express.Response) => {
  return res.status(200).send({
    message: "Hello World!",
  });
});

// Mount table routers under "/"
app.use("/", router);

app.listen(port, () => {
  console.log("Listening on " + port);
});

export default app;

// Provide a CommonJS-compatible export for existing JS tests/consumers
(module as any).exports = app;
