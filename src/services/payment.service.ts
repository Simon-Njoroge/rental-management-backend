// // src/services/payment/payment.service.ts
// import { Injectable,NotFoundException,BadRequestException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Payment } from '../entities/payment.entity';
// import { Invoice } from '../entities/invoice.entity';
// import { MpesaService } from './mpesa.service';
// import { StripeService } from './stripe.service';
// import { BookingService } from './booking.service';

// @Injectable()
// export class PaymentService {
//   constructor(
//     @InjectRepository(Payment)
//     private paymentRepository: Repository<Payment>,
//     @InjectRepository(Invoice)
//     private invoiceRepository: Repository<Invoice>,
//     private mpesaService: MpesaService,
//     private stripeService: StripeService
//   ) {}

//   async processPayment(invoiceId: string, method: 'mpesa' | 'stripe', details: any) {
//     try {
//       const invoice = await this.invoiceRepository.findOne({
//         where: { id: invoiceId },
//         relations: ['booking']
//       });

//       if (!invoice) {
//         throw new NotFoundException('Invoice not found');
//       }

//       let paymentResult;
//       if (method === 'mpesa') {
//         paymentResult = await this.mpesaService.initiatePayment(
//           details.phoneNumber,
//           invoice.amount
//         );
//       } else {
//         paymentResult = await this.stripeService.chargeCard(
//           details.token,
//           invoice.amount
//         );
//       }

//       const payment = this.paymentRepository.create({
//         invoice,
//         amount: invoice.amount,
//         method,
//         transactionId: paymentResult.transactionId,
//         status: 'completed'
//       });

//       await this.paymentRepository.save(payment);

//       // Update booking status
//       await this.BookingService.confirmBooking(invoice.booking.id);

//       return payment;
//     } catch (error) {
//       this.handlePaymentError(error);
//     }
//   }

//   private handlePaymentError(error: any): never {
    
//     if (error.isPaymentError) {
//       throw new BadRequestException(error.message);
//     }
//     this.handleError(error, 'processPayment');
//   }
// }