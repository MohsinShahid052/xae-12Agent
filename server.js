import "@shopify/shopify-app-remix/adapters/node";
import { createRequestHandler } from "@remix-run/express";
import express from "express";
import compression from "compression";
import { createServer } from "http";

const app = express();
const PORT = process.env.PORT || 3000;

// Needed for all request handlers
app.use(compression());
app.use(express.static("public"));

// This handles all routes
app.all(
  "*",
  createRequestHandler({
    build: await import("./build/server/index.js"),
    mode: process.env.NODE_ENV,
  })
);

const httpServer = createServer(app);

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});