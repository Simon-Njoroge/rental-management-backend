import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { Invoice, InvoiceStatus } from "../entities/invoice.entity";
import { Booking, BookingStatus } from "../entities/booking.entity";

export const generateInvoicePdf = async (
  invoice: Invoice,
  booking: Booking,
  savePath?: string
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    let fileStream: fs.WriteStream | undefined;
    if (savePath) {
      fileStream = fs.createWriteStream(savePath);
      doc.pipe(fileStream);
    }

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const isCancelled =
      invoice.status === InvoiceStatus.CANCELLED || booking.status === BookingStatus.CANCELLED;
    const isPaid = invoice.status === InvoiceStatus.PAID;

    // Helper function to draw table
    const drawTable = (
      startX: number,
      startY: number,
      data: Array<[string, string]>,
      options: {
        columnWidths: [number, number];
        rowHeight?: number;
        headerBg?: string;
        borderColor?: string;
        textColor?: string;
        fontSize?: number;
      } = { columnWidths: [200, 200] }
    ) => {
      const {
        columnWidths = [200, 200],
        rowHeight = 25,
        headerBg = "#f8f9fa",
        borderColor = "#dee2e6",
        textColor = "black",
        fontSize = 11
      } = options;

      let currentY = startY;
      const tableWidth = columnWidths[0] + columnWidths[1];

      // Draw table borders and fill rows
      data.forEach((row, index) => {
        // Fill row background (alternating colors for better readability)
        if (index % 2 === 0) {
          doc.rect(startX, currentY, tableWidth, rowHeight).fill("#f8f9fa");
        }

        // Draw cell borders
        doc.strokeColor(borderColor).lineWidth(0.5);
        doc.rect(startX, currentY, columnWidths[0], rowHeight).stroke();
        doc.rect(startX + columnWidths[0], currentY, columnWidths[1], rowHeight).stroke();

        // Add text
        doc.fillColor(textColor).fontSize(fontSize);
        
        // First column (label) - bold
        doc.font("Helvetica-Bold")
           .text(row[0], startX + 8, currentY + 8, {
             width: columnWidths[0] - 16,
             height: rowHeight - 16,
             ellipsis: true
           });

        // Second column (value) - regular
        doc.font("Helvetica")
           .text(row[1], startX + columnWidths[0] + 8, currentY + 8, {
             width: columnWidths[1] - 16,
             height: rowHeight - 16,
             ellipsis: true
           });

        currentY += rowHeight;
      });

      return currentY;
    };

    // Helper function for charges table
    const drawChargesTable = (startX: number, startY: number) => {
      const columnWidths = [250, 100, 100];
      const rowHeight = 30;
      const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);

      // Table header
      doc.rect(startX, startY, tableWidth, rowHeight).fill("#007ACC");
      doc.strokeColor("#dee2e6").lineWidth(0.5);
      doc.rect(startX, startY, columnWidths[0], rowHeight).stroke();
      doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight).stroke();
      doc.rect(startX + columnWidths[0] + columnWidths[1], startY, columnWidths[2], rowHeight).stroke();

      // Header text
      doc.fillColor("white").fontSize(12).font("Helvetica-Bold");
      doc.text("Description", startX + 8, startY + 10, { width: columnWidths[0] - 16 });
      doc.text("Qty", startX + columnWidths[0] + 8, startY + 10, { width: columnWidths[1] - 16, align: "center" });
      doc.text("Amount", startX + columnWidths[0] + columnWidths[1] + 8, startY + 10, { width: columnWidths[2] - 16, align: "right" });

      let currentY = startY + rowHeight;

      // Data row
      doc.rect(startX, currentY, tableWidth, rowHeight).fill("white");
      doc.rect(startX, currentY, columnWidths[0], rowHeight).stroke();
      doc.rect(startX + columnWidths[0], currentY, columnWidths[1], rowHeight).stroke();
      doc.rect(startX + columnWidths[0] + columnWidths[1], currentY, columnWidths[2], rowHeight).stroke();

      doc.fillColor("black").fontSize(11).font("Helvetica");
      doc.text("Tour Package - Standard package incl. hotel & guide", startX + 8, currentY + 8, { width: columnWidths[0] - 16 });
      doc.text("1", startX + columnWidths[0] + 8, currentY + 8, { width: columnWidths[1] - 16, align: "center" });
      doc.text(`$${Number(invoice.amount).toFixed(2)}`, startX + columnWidths[0] + columnWidths[1] + 8, currentY + 8, { width: columnWidths[2] - 16, align: "right" });

      currentY += rowHeight;

      // Total row
      doc.rect(startX, currentY, tableWidth, rowHeight).fill("#f8f9fa");
      doc.rect(startX, currentY, columnWidths[0] + columnWidths[1], rowHeight).stroke();
      doc.rect(startX + columnWidths[0] + columnWidths[1], currentY, columnWidths[2], rowHeight).stroke();

      doc.fillColor("black").fontSize(12).font("Helvetica-Bold");
      doc.text("Total Amount", startX + 8, currentY + 8, { width: columnWidths[0] + columnWidths[1] - 16, align: "right" });
      doc.text(`$${Number(invoice.amount).toFixed(2)}`, startX + columnWidths[0] + columnWidths[1] + 8, currentY + 8, { width: columnWidths[2] - 16, align: "right" });

      return currentY + rowHeight;
    };

    // Company Logo and Header
    const logoPath = path.resolve(__dirname, "logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 60 });
    }

    // Company Info
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("black")
      .text("Booking App", 120, 50)
      .fontSize(10)
      .font("Helvetica")
      .text("Your Trusted Travel Partner", 120, 75)
      .text("support@bookingapp.com", 120, 90);

    // Invoice title and status
    doc.moveDown(3);
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor(isCancelled ? "red" : "#007ACC")
      .text(isCancelled ? "INVOICE (CANCELLED)" : "INVOICE", { align: "center" });

    if (isPaid) {
      doc.fontSize(16).fillColor("#28a745").text("✓ PAID", { align: "center" });
    } else if (invoice.status === InvoiceStatus.PENDING) {
      doc.fontSize(16).fillColor("#FFA500").text("⏳ PENDING PAYMENT", { align: "center" });
    }

    // Watermark for cancelled invoices
    if (isCancelled) {
      doc
        .fontSize(80)
        .fillColor("red")
        .opacity(0.1)
        .rotate(-45, { origin: [300, 400] })
        .text("CANCELLED", 50, 350, { align: "center", width: 500 })
        .rotate(45, { origin: [300, 400] })
        .opacity(1);
    }

    doc.moveDown(2);

    // Invoice Details Table
    const invoiceData: Array<[string, string]> = [
      ["Invoice Number", invoice.invoiceNumber],
      ["Status", invoice.status],
      ["Payment Status", isPaid ? "Paid" : "Unpaid"],
      ["Amount", `$${Number(invoice.amount).toFixed(2)}`],
      ["Due Date", invoice.dueDate.toDateString()],
      ["Date Issued", invoice.createdAt ? new Date(invoice.createdAt).toDateString() : new Date().toDateString()]
    ];

    let currentY = doc.y;
    doc.fontSize(16).font("Helvetica-Bold").fillColor("#007ACC").text("Invoice Details", 50, currentY);
    currentY += 25;

    currentY = drawTable(50, currentY, invoiceData, {
      columnWidths: [150, 200],
      rowHeight: 25
    });

    // Booking Information Table
    const bookingData: Array<[string, string]> = [
      ["Booking Reference", booking.id],
      ["Customer Name", booking.user?.firstname || "N/A"],
      ["Start Date", booking.startDate?.toDateString() || "N/A"],
      ["End Date", booking.endDate?.toDateString() || "N/A"]
    ];

    // Add special requests if they exist
    if (booking.specialRequests && Object.keys(booking.specialRequests).length > 0) {
      Object.entries(booking.specialRequests).forEach(([key, value]) => {
        bookingData.push([`Special Request (${key})`, String(value)]);
      });
    } else {
      bookingData.push(["Special Requests", "None"]);
    }

    currentY += 30;
    doc.fontSize(16).font("Helvetica-Bold").fillColor("#28a745").text("Booking Information", 50, currentY);
    currentY += 25;

    currentY = drawTable(50, currentY, bookingData, {
      columnWidths: [150, 200],
      rowHeight: 25
    });

    // Charges Table
    currentY += 30;
    doc.fontSize(16).font("Helvetica-Bold").fillColor("#6f42c1").text("Charges", 50, currentY);
    currentY += 25;

    currentY = drawChargesTable(50, currentY);

    // Payment Instructions or Thank You
    currentY += 40;
    if (!isPaid && !isCancelled) {
      doc.rect(50, currentY, 450, 60).fill("#e7f3ff").stroke("#007ACC");
      doc
        .fontSize(12)
        .fillColor("#007ACC")
        .font("Helvetica-Bold")
        .text("Payment Instructions:", 60, currentY + 10)
        .font("Helvetica")
        .text("Please make payment to the account details provided in your booking portal.", 60, currentY + 30, {
          width: 430
        });
    } else if (isPaid) {
      doc.rect(50, currentY, 450, 40).fill("#d4edda").stroke("#28a745");
      doc
        .fontSize(14)
        .fillColor("#28a745")
        .font("Helvetica-Bold")
        .text("✓ Thank you for your payment!", 60, currentY + 15, {
          align: "center",
          width: 430
        });
    }

    // Footer
    const pageHeight = doc.page.height;
    doc
      .fontSize(10)
      .fillColor("gray")
      .font("Helvetica")
      .text(
        "If you have any questions about this invoice, please contact support@bookingapp.com",
        50, pageHeight - 60,
        { align: "center", width: 450 }
      )
      .text("Thank you for choosing Booking App!", 50, pageHeight - 45, {
        align: "center",
        width: 450
      });

    doc.end();
  });
};