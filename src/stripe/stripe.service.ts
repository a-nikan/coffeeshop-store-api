import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  // The stripe client will be stored here
  private stripe: Stripe;

  // We inject the ConfigService to access environment variables
  constructor(private configService: ConfigService) {}

  // OnModuleInit is a NestJS lifecycle hook. It runs once the module has been initialized.
  // We use this instead of the constructor for initialization logic that might fail.
  onModuleInit() {
    // 1. Get the secret key from the environment variables
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    // 2. Validate that the key actually exists.
    // This is the crucial step that solves the TypeScript error.
    if (!stripeSecretKey) {
      throw new Error(
        'Stripe secret key is not defined in environment variables. Please check your .env file.',
      );
    }

    // 3. Initialize the Stripe library with the validated key and your API version.
    // Because of the check above, TypeScript now knows stripeSecretKey is a 'string'.
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }

  // We will create a public method to access the stripe client later
  public getStripeClient(): Stripe {
    return this.stripe;
  }

  async createPaymentIntent(amount: number, currency: string) {
    // Stripe expects the amount in the smallest currency unit (e.g., cents).
    // So, we must multiply the dollar amount by 100.
    const amountInCents = Math.round(amount * 100);

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency,
        // 'automatic_payment_methods' is the modern way to let Stripe
        // handle various payment options like cards, Apple Pay, etc.
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // The method should return the client_secret
      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      // Handle potential errors from the Stripe API
      console.error('Error creating Payment Intent:', error);
      throw new Error('Could not create payment intent.');
    }
  }
}
