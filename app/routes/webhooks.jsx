import { Buffer } from "node:buffer";
import crypto from "node:crypto";

export const action = async ({ request }) => {
  try {
    // Get the HMAC header
    const hmacHeader = request.headers.get("X-Shopify-Hmac-SHA256");
    
    if (!hmacHeader) {
      return new Response("Missing HMAC header", { status: 401 });
    }
    
    // Get the raw body as a buffer
    const rawBody = await request.arrayBuffer();
    const bodyBuffer = Buffer.from(rawBody);
    
    // Get your app secret from environment variables
    const secret = process.env.SHOPIFY_API_SECRET;
    
    // Calculate the HMAC digest
    const calculatedHmac = crypto
      .createHmac("sha256", secret)
      .update(bodyBuffer)
      .digest("base64");
    
    // Validate the HMAC
    const isValid = crypto.timingSafeEqual(
      Buffer.from(calculatedHmac),
      Buffer.from(hmacHeader)
    );
    
    if (!isValid) {
      return new Response("HMAC validation failed", { status: 401 });
    }
    
    // If valid, parse the body and process
    const body = JSON.parse(bodyBuffer.toString("utf8"));
    const topic = request.headers.get("X-Shopify-Topic");
    const shop = request.headers.get("X-Shopify-Shop-Domain");
    
    console.log(`Valid webhook received: ${topic} from ${shop}`);
    
    // Return 200 OK for valid webhooks
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};