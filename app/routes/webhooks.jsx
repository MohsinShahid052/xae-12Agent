import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    // This will validate the HMAC and return a 401 if invalid
    const { topic } = await authenticate.webhook(request);
    
    // If we get here, the HMAC was valid
    console.log(`Webhook received: ${topic}`);
    
    // Return 200 OK for valid webhooks
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(`Webhook error: ${error.message}`);
    
    // This will return 401 Unauthorized for invalid HMAC signatures
    // which is what Shopify is looking for
    if (error.message.includes("hmac")) {
      return new Response(error.message, { status: 401 });
    }
    
    // For other errors, return 500
    return new Response(error.message, { status: 500 });
  }
};