import PDFDocument from "pdfkit";
import Table from "pdfkit-table";
import fs from "fs";
import path from "path";
import { Invoice, InvoiceStatus } from "../entities/invoice.entity";
import { Booking ,BookingStatus} from "../entities/booking.entity";

export const generateInvoicePdf = (invoice: Invoice, booking: Booking): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: any[] = [];

    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const isCancelled = invoice.status === InvoiceStatus.CANCELLED || booking.status === BookingStatus.CANCELLED;

    // Optional logo
    const logoPath = path.resolve("path/to/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 60 });
    }

    // Watermark if cancelled
    if (isCancelled) {
      doc.fontSize(60)
        .fillColor("red")
        .opacity(0.3)
        .rotate(-45, { origin: [300, 300] })
        .text("CANCELLED", 100, 300, { align: "center" })
        .rotate(45, { origin: [300, 300] })
        .opacity(1); // reset opacity
    }

    // Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("black")
      .text("Booking App", 0, 50, { align: "center" });

    doc
      .fontSize(16)
      .font("Helvetica")
      .fillColor(isCancelled ? "red" : "black")
      .text(isCancelled ? "Booking Invoice (Cancelled)" : "Booking Invoice", { align: "center" })
      .moveDown(1.5);

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1.5);

    // Colored Header - Invoice Details
    doc
      .rect(50, doc.y, 500, 20)
      .fill("#007ACC")
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Invoice Details", 60, doc.y + 5);
    doc.moveDown(1.5);

    doc.fillColor("black").font("Helvetica").fontSize(12);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Amount: $${Number(invoice.amount).toFixed(2)}`);
    doc.text(`Due Date: ${invoice.dueDate.toDateString()}`);
    doc.text(`Status: ${invoice.status}`);

    if (isCancelled) {
      doc.moveDown(0.5);
      doc.fillColor("red").font("Helvetica-Bold")
        .text("⚠️ This invoice is for a cancelled booking.", { underline: true });
    }

    doc.moveDown(1.5);

    // Colored Header - Booking Info
    doc
      .rect(50, doc.y, 500, 20)
      .fill("#28a745")
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Booking Information", 60, doc.y + 5);
    doc.moveDown(1.5);

    doc.fillColor("black").font("Helvetica").fontSize(12);
    doc.text(isCancelled?`null`:`Start Date: ${booking.startDate.toDateString()}`);
    doc.text(isCancelled?`null`:`End Date: ${booking.endDate.toDateString()}`);
    doc.text(isCancelled?`null`:`Special Requests: ${booking.specialRequests || "None"}`);
    doc.moveDown(1.5);

    // Booking Summary
    doc.font("Helvetica-Bold").fontSize(14).text("Booking Summary");
    doc.moveDown(0.5);

    const table = {
      headers: ["Item", "Description", "Amount"],
      rows: [
        ["Tour Package", "Standard package incl. hotel & guide", `$${Number(invoice.amount).toFixed(2)}`],
      ],
    };

    (doc as any).table(table, {
      width: 500,
      padding: 5,
      columnSpacing: 10,
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
      prepareRow: (row: any, i: number) => doc.font("Helvetica").fontSize(12),
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).fillColor("gray")
      .text("If you have any questions about this invoice, contact support@bookingapp.com", { align: "center" });
    doc.text("Thank you for choosing Booking App!", { align: "center" });

    doc.end();
  });
};
