# Payment Integration with Stripe

This document outlines the placeholder payment system implemented for the On-Brella project and provides guidance for integrating with Stripe.

## Overview

The payment system consists of:
- `usePayment` hook (`src/hooks/usePayment.js`) - Custom hook for payment processing
- `PaymentForm` component (`src/components/PaymentForm.jsx`) - Example payment form component
- Placeholder implementation that simulates payment processing

## Current Implementation

The current implementation provides a placeholder that:
- Simulates payment processing with a 2-second delay
- Returns mock payment results
- Includes error handling and loading states
- Logs payment data (without sensitive information) to console

## Integration with Stripe

### 1. Install Stripe Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Set up Stripe Provider

Wrap your app with Stripe Elements provider:

```jsx
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Elements stripe={stripePromise}>
      <YourApp />
    </Elements>
  );
}
```

### 3. Replace usePayment Hook Implementation

Update `src/hooks/usePayment.js` to use real Stripe APIs:

```javascript
import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

export function usePayment() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [lastPaymentResult, setLastPaymentResult] = useState(null);

  const processPayment = async (paymentData) => {
    if (!stripe || !elements) {
      throw new Error('Stripe not initialized');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: paymentData.billingDetails,
      });

      if (methodError) {
        throw new Error(methodError.message);
      }

      // Call your backend to create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentData.amount,
          currency: paymentData.currency,
          paymentMethodId: paymentMethod.id,
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret);

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      setLastPaymentResult(paymentIntent);
      return paymentIntent;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  // ... rest of the hook implementation
}
```

### 4. Update PaymentForm Component

Replace the manual card inputs with Stripe Elements:

```jsx
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export function PaymentForm({ amount, currency = 'usd', onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const { processPayment, isProcessing, error } = usePayment();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      const result = await processPayment({
        amount,
        currency,
        billingDetails: {
          name: cardholderName,
          email: email,
        },
      });

      onSuccess?.(result);
    } catch (err) {
      onError?.(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
          },
        }}
      />
      <button disabled={!stripe || isProcessing}>
        Pay {formatAmount(amount)}
      </button>
    </form>
  );
}
```

### 5. Backend Integration

Create backend endpoints for payment processing:

```javascript
// POST /api/create-payment-intent
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency, paymentMethodId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## Usage Example

```jsx
import { PaymentForm } from './components/PaymentForm';
import { useRental } from './context/RentalContext';

function CheckoutPage() {
  const { lastReturnSummary } = useRental();

  const handlePaymentSuccess = (paymentResult) => {
    console.log('Payment successful:', paymentResult);
    // Navigate to success page or update rental status
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    // Show error message to user
  };

  if (!lastReturnSummary) {
    return <div>No rental to pay for</div>;
  }

  return (
    <div>
      <h1>Complete Your Payment</h1>
      <p>Rental Cost: ${(lastReturnSummary.costCents / 100).toFixed(2)}</p>

      <PaymentForm
        amount={lastReturnSummary.costCents}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  );
}
```

## Security Considerations

1. **Never store card details** - Use Stripe Elements for secure card input
2. **Use HTTPS** - Always serve payment forms over HTTPS
3. **Validate amounts** - Double-check payment amounts on the backend
4. **Handle errors gracefully** - Provide clear error messages to users
5. **PCI Compliance** - Stripe handles PCI compliance when using Elements

## Testing

Use Stripe test cards for development:
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

## Environment Variables

Add to your `.env` file:
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```