import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY?.trim(), {
  apiVersion: "2023-10-16",
});

export const PRICE_ID = process.env.STRIPE_PRICE_ID?.trim();
export const TRIAL_PRICE_ID = process.env.STRIPE_TRIAL_PRICE_ID?.trim();
