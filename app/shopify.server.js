import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  DeliveryMethod,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

// Define your app URL - ensure this is set in your environment variables
const appUrl = process.env.SHOPIFY_APP_URL || "https://xae-12agent.onrender.com";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: appUrl,
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  // Add webhook configuration with explicit callbackUrls
  webhooks: {
    path: "/webhooks",
    webhooks: [
      {
        topic: "APP_UNINSTALLED",
        deliveryMethod: DeliveryMethod.Http,
        path: "/webhooks/app/uninstalled",
        callbackUrl: `${appUrl}/webhooks/app/uninstalled`,
      },
      {
        topic: "APP_SUBSCRIPTIONS_UPDATE",
        deliveryMethod: DeliveryMethod.Http,
        path: "/webhooks/app/scopes_update",
        callbackUrl: `${appUrl}/webhooks/app/scopes_update`,
      },
      {
        topic: "CUSTOMERS_DATA_REQUEST",
        deliveryMethod: DeliveryMethod.Http,
        path: "/webhooks/customers/data_request",
        callbackUrl: `${appUrl}/webhooks/customers/data_request`,
      },
      {
        topic: "CUSTOMERS_REDACT",
        deliveryMethod: DeliveryMethod.Http,
        path: "/webhooks/customers/redact",
        callbackUrl: `${appUrl}/webhooks/customers/redact`,
      },
      {
        topic: "SHOP_REDACT",
        deliveryMethod: DeliveryMethod.Http,
        path: "/webhooks/shop/redact",
        callbackUrl: `${appUrl}/webhooks/shop/redact`,
      },
    ],
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;