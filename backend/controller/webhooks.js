import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripewebhooks = async (request, response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        const { transactionId, appId } = session.metadata;

        if (appId === "thankhamanigpt") {
          const transaction = await Transaction.findOne({
            _id: transactionId,
            isPaid: false,
          });

          if (transaction) {
            // Add credits to user
            await User.updateOne(
              { _id: transaction.userId },
              { $inc: { credits: transaction.credits } }
            );

            // Mark transaction as paid
            transaction.isPaid = true;
            await transaction.save();

            console.log("✅ User credits updated for:", transaction.userId);
          } else {
            console.log("⚠️ Transaction not found or already paid");
          }
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    response.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error", error);
    response.status(500).send("Internal Server Error");
  }
};
