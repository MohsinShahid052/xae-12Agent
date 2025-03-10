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
    console.error(`Webhook error:`, error);
    
    // Safely check if error message exists and contains 'hmac'
    const errorMessage = error?.message || '';
    
    // This will return 401 Unauthorized for invalid HMAC signatures
    // which is what Shopify is looking for
    if (errorMessage.includes("hmac")) {
      return new Response(errorMessage, { status: 401 });
    }
    
    // If this is an HMAC validation error but doesn't have a message property
    // (checking for common error types)
    if (error && (error.name === 'ShopifyHmacError' || error.code === 'HMAC_VALIDATION_FAILED')) {
      return new Response("HMAC validation failed", { status: 401 });
    }
    
    // For other errors, return 500
    return new Response("Internal server error", { status: 500 });
  }
};