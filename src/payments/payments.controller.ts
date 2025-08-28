import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard) // Protect the endpoint
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const { amount } = createPaymentIntentDto;

    // We'll use 'usd' for now, but this could also come from the DTO
    const currency = 'usd';

    return this.stripeService.createPaymentIntent(amount, currency);
  }
}
