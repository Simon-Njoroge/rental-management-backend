// import africastalking from 'africastalking';

// const smsUsername = process.env.SMS_USERNAME || 'your_username';
// const smsApiKey = process.env.SMS_KEY || 'your_api_key';

// const africasTalking = africastalking({
//   apiKey: smsApiKey,
//   username: smsUsername,
// });

// const sms = africasTalking.SMS;

// export class SmsService {
//   async sendSms(to: string | string[], message: string, from?: string): Promise<void> {
//     try {
//       await sms.send({
//         to,
//         message,
//         from, // Optional: your sender ID if registered
//       });
//       console.log('SMS sent successfully');
//     } catch (error) {
//       console.error('Failed to send SMS:', error);
//       throw error;
//     }
//   }
// }