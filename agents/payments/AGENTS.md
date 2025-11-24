# Payments Agent (Stripe)

## Responsibilities

- Verify webhook signatures on all Stripe events
- Use idempotency keys for all mutating operations
- Model order states explicitly (pending → paid → fulfilled → refunded)
- Never store or log card data
- Emit analytics for payment events
- Implement retry logic for transient failures

## Webhook Security

```typescript
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }
  
  // Process event...
}
```

## Order State Machine

```
┌──────────┐    payment_intent.created     ┌──────────┐
│ PENDING  │ ─────────────────────────────>│ AWAITING │
└──────────┘                               │ PAYMENT  │
                                           └──────────┘
                                                 │
                              payment_intent.succeeded
                                                 │
                                                 ▼
┌──────────┐    fulfillment.completed      ┌──────────┐
│FULFILLED │ <─────────────────────────────│   PAID   │
└──────────┘                               └──────────┘
     │                                           │
     │ charge.refunded                           │ charge.refunded
     ▼                                           ▼
┌──────────┐                               ┌──────────┐
│ REFUNDED │                               │ REFUNDED │
└──────────┘                               └──────────┘
```

## Idempotency

```typescript
// Always use idempotency keys for mutations
const paymentIntent = await stripe.paymentIntents.create(
  {
    amount: 1000,
    currency: 'usd',
    customer: customerId,
  },
  {
    idempotencyKey: `order_${orderId}_payment`,
  }
);
```

## Webhook Events to Handle

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Update order to PAID, trigger fulfillment |
| `payment_intent.payment_failed` | Notify user, allow retry |
| `charge.refunded` | Update order to REFUNDED, credit user |
| `customer.subscription.created` | Enable premium features |
| `customer.subscription.deleted` | Revoke premium access |
| `invoice.payment_failed` | Notify user, retry or cancel |

## Analytics Events

```typescript
// Checkout started
posthog.capture('checkout_started', {
  correlationId,
  orderId,
  amount: cart.total,
  itemCount: cart.items.length,
});

// Purchase completed
posthog.capture('purchase_completed', {
  correlationId,
  orderId,
  amount: paymentIntent.amount,
  paymentMethod: paymentIntent.payment_method_types[0],
});

// Refund issued
posthog.capture('refund_issued', {
  correlationId,
  orderId,
  amount: refund.amount,
  reason: refund.reason,
});
```

## Error Handling

```typescript
try {
  const paymentIntent = await stripe.paymentIntents.create({...});
} catch (error) {
  if (error instanceof Stripe.errors.StripeCardError) {
    // Card declined - show user-friendly message
    return { error: 'card_declined', message: error.message };
  }
  if (error instanceof Stripe.errors.StripeRateLimitError) {
    // Too many requests - retry with backoff
    await delay(exponentialBackoff(attempt));
    return retry();
  }
  if (error instanceof Stripe.errors.StripeAPIError) {
    // Stripe API issue - log and alert
    logger.error('Stripe API error', { error, correlationId });
    throw error;
  }
  throw error;
}
```

## Security Rules

- ❌ Never log card numbers, CVV, or full card details
- ❌ Never store raw card data in database
- ✅ Use Stripe Elements for card input
- ✅ Use PaymentIntent for SCA compliance
- ✅ Store only Stripe customer/payment method IDs
- ✅ Use Stripe's PCI-compliant hosted fields

## Testing

```typescript
// Use Stripe test mode
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Test card numbers
// 4242424242424242 - Success
// 4000000000000002 - Declined
// 4000000000009995 - Insufficient funds
// 4000002500003155 - Requires 3DS
```

## When Unsure

Verify signatures. Use idempotency keys. Never store card data. Log errors, not card details.
