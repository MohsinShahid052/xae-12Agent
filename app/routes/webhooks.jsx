import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    // Don't clone the request - this can cause issues with body parsing
    // Instead, use the original request directly
    const { topic, shop } = await authenticate.webhook(request);
    
    // If we get here, the HMAC was valid
    console.log(`Webhook received: ${topic} from ${shop}`);
    
    // Important: For webhooks, you should return a 200 status immediately
    // Process any business logic asynchronously after sending the response
    return new Response(null, { 
      status: 200,
      headers: {
        "Content-Type": "text/plain"
      }
    });
  } catch (error) {
    console.error(`Webhook error details:`, error);
    
    // Adding more detailed logging to troubleshoot
    if (error && error.message) {
      console.error(`Error message: ${error.message}`);
    }
    
    // Return 401 for HMAC validation failures
    if (error && error.message && (
      error.message.includes("hmac") || 
      error.message.includes("HMAC") ||
      error.message.includes("signature")
    )) {
      return new Response("HMAC validation failed", { 
        status: 401,
        headers: {
          "Content-Type": "text/plain"
        }
      });
    }
    
    // For other errors, return 500
    return new Response("Internal server error", { 
      status: 500,
      headers: {
        "Content-Type": "text/plain"
      }
    });
  }
};