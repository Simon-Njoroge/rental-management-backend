import axios from "axios";
import { Logger } from "./logger";
import * as dotenv from "dotenv";

dotenv.config();

export class MpesaClient {
  private static readonly baseURL = "https://sandbox.safaricom.co.ke";
  private static readonly shortCode = process.env.MPESA_SHORTCODE!;
  private static readonly passkey = process.env.MPESA_PASSKEY!;
  private static readonly consumerKey = process.env.MPESA_CONSUMER_KEY!;
  private static readonly consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  private static readonly callbackURL = process.env.MPESA_CALLBACK_URL!;

  /**
   * Get OAuth access token from Safaricom
   */
  private static async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString("base64");

    try {
      const response = await axios.get(
        `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: { Authorization: `Basic ${auth}` },
        }
      );

      return response.data.access_token;
    } catch (error) {
      Logger.error("Failed to get MPESA access token", error);
      throw new Error("MPESA authentication failed");
    }
  }

  /**
   * Format timestamp required by MPESA
   */
  private static getTimestamp(): string {
    const date = new Date();
    return date.toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
  }

  /**
   * Generate password for STK Push
   */
  private static generatePassword(timestamp: string): string {
    const data = `${this.shortCode}${this.passkey}${timestamp}`;
    return Buffer.from(data).toString("base64");
  }

  /**
   * Normalize phone number to 2547XXXXXXXX format
   */
  private static formatPhone(phone: string): string {
    let normalized = phone.trim();
    if (normalized.startsWith("0")) {
      normalized = "254" + normalized.substring(1);
    }
    if (normalized.startsWith("+")) {
      normalized = normalized.substring(1);
    }
    return normalized;
  }

  /**
   * Interpret MPESA ResultCode for better error handling
   */
  private static interpretMpesaResult(code: number, desc?: string): string {
    switch (code) {
      case 0:
        return "Transaction completed successfully.";
      case 1:
        return "Insufficient balance.";
      case 1032:
        return "Transaction cancelled by the user.";
      case 1037:
        return "Request timed out.";
      case 2001:
        return "Invalid request parameters.";
      case 4001:
        return "Invalid access credentials.";
      default:
        return desc || "Unknown error occurred.";
    }
  }

  /**
   * Initiate STK Push Request
   */
public static async stkPush(phoneNumber: string, amount: number, reference: string): Promise<any> {
  const accessToken = await this.getAccessToken();
  const timestamp = this.getTimestamp();
  const password = this.generatePassword(timestamp);

  const payload = {
    BusinessShortCode: this.shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: this.formatPhone(phoneNumber),
    PartyB: this.shortCode,
    PhoneNumber: this.formatPhone(phoneNumber),
    CallBackURL: this.callbackURL,
    AccountReference: reference,
    TransactionDesc: "Payment for booking",
  };

  try {
    const response = await axios.post(
      `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = response.data;

    if (data.ResponseCode !== "0") {
      throw new Error(data.errorMessage || data.ResponseDescription || "STK Push rejected by MPESA");
    }

    Logger.log("STK Push initiated", data);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const query = await this.expressQuery(data.CheckoutRequestID);

    const resultCode = parseInt(query.ResultCode, 10);
    if (resultCode !== 0) {
      const reason = this.interpretMpesaResult(resultCode, query.ResultDesc);
      Logger.warn(`MPESA STK Push failed: ${reason}`);
      throw new Error(reason);
    }

    return {
      ...data,
      queryResult: query,
    };

  } catch (err: any) {
    const message = err.message?.toLowerCase() || "";

    if (message.includes("insufficient balance")) {
      throw new Error("You have insufficient funds. Please top up your M-PESA and try again.");
    }
    if (message.includes("cancelled")) {
      throw new Error("Payment was cancelled. Please try again if this was unintentional.");
    }
    if (message.includes("timeout")) {
      throw new Error("Payment request timed out. Please try again.");
    }

    Logger.error("MPESA STK Push failed", err.response?.data || err.message);
    throw new Error(
      err.response?.data?.errorMessage ||
      err.response?.data?.ResponseDescription ||
      err.message ||
      "MPESA STK Push failed"
    );
  }
}


  /**
   * Query STK Push status
   */
  // Change expressQuery from private to public
public static async expressQuery(checkoutRequestId: string): Promise<any> {
  const accessToken = await this.getAccessToken(); // get token inside

  const timestamp = this.getTimestamp();
  const password = this.generatePassword(timestamp);

  const payload = {
    BusinessShortCode: this.shortCode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  try {
    const response = await axios.post(
      `${this.baseURL}/mpesa/stkpushquery/v1/query`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    Logger.log("STK Query response", response.data);
    return response.data;
  } catch (error: any) {
    Logger.error("MPESA Express Query failed", error.response?.data || error.message);
    throw new Error("Failed to query MPESA transaction status.");
  }
}

}
