import { Resend } from "resend";
import { ENV } from "./env.js";

// Create Resend client only when API key is provided to avoid crashing
// the app during development or when env vars are missing.
let resendClient = null;
if (ENV.RESEND_API_KEY) {
  try {
    resendClient = new Resend(ENV.RESEND_API_KEY);
  } catch (err) {
    // If constructor throws for any reason, keep resendClient null and log a warning
    console.warn("Failed to initialize Resend client:", err.message);
    resendClient = null;
  }
} else {
  console.warn("RESEND_API_KEY is not set. Email sending is disabled.");
}

export { resendClient };

export const sender = {
  email: ENV.EMAIL_FROM,
  name: ENV.EMAIL_FROM_NAME,
};
