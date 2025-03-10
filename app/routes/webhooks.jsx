import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    // Clone the request to preserve the original body for HMAC validation
    const clonedRequest = request.clone();
    
    // This will validate the HMAC and return a 401 if invalid
    const { topic, shop } = await authenticate.webhook(clonedRequest);
    
    // If we get here, the HMAC was valid
    console.log(`Webhook received: ${topic} from ${shop}`);
    
    // Process the webhook payload
    const payload = await request.json();
    
    // Perform your business logic here
    // ...
    
    // Return 200 OK for valid webhooks
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(`Webhook error details:`, error);
    
    // Return 401 for HMAC validation failures
    if (error && error.message && error.message.includes("hmac")) {
      return new Response("HMAC validation failed", { status: 401 });
    }
    
    // For other errors, return 500
    return new Response("Internal server error", { status: 500 });
  }
};