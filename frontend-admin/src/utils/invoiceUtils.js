import jsPDF from "jspdf";
import axios from "axios";

export const createInvoice = async (invoiceData, orderDetails, calculateTotal, receivedAmount, discount, creditAmount, change, onSuccess, onError) => {
  try {
    // Send invoice data to the backend
    const response = await axios.post("http://localhost:8081/api/invoices", invoiceData);
    alert(`Invoice created successfully! Invoice ID: ${response.data.invoiceID}`);

    // Download the invoice as a PDF
    downloadInvoice(orderDetails, calculateTotal, receivedAmount, discount, creditAmount, change);

    // Call the success callback
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Error creating invoice:", error.response?.data || error.message);
    alert("Failed to create invoice.");

    // Call the error callback
    if (onError) onError(error);
  }
};

const downloadInvoice = (orderDetails, calculateTotal, receivedAmount, discount, creditAmount, change) => {
    const doc = new jsPDF();
    
    // Set colors and styles
    const primaryColor = [0, 51, 102]; // Dark blue
    const secondaryColor = [80, 80, 80]; // Dark gray for text
    
    // Add company logo/header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("INVOICE", 105, 15, { align: "center" });
    
    // Add invoice details section
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.roundedRect(10, 35, 190, 30, 3, 3);
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("INVOICE TO:", 15, 43);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`${orderDetails.order.customerName}`, 15, 50);
    doc.text(`${orderDetails.order.customerEmail}`, 15, 57);
    
    // Add invoice metadata on right side
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("INVOICE NUMBER:", 140, 43);
    doc.text("DATE:", 140, 50);
    doc.text("DUE DATE:", 140, 57);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`#${orderDetails.order.orderID || "INV-" + Date.now().toString().slice(-6)}`, 190, 43, { align: "right" });
    
    // Current date in DD/MM/YYYY format
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    doc.text(formattedDate, 190, 50, { align: "right" });
    doc.text(formattedDate, 190, 57, { align: "right" }); // Same date for due date in this example
    
    // Table header with background
    doc.setFillColor(240, 240, 240);
    doc.rect(10, 70, 190, 10, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("PRODUCT", 15, 77);
    doc.text("QUANTITY", 95, 77, { align: "center" });
    doc.text("UNIT PRICE", 140, 77, { align: "center" });
    doc.text("TOTAL", 190, 77, { align: "right" });
    
    // Table content
    let yPosition = 87;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    orderDetails.items.forEach((product, index) => {
      // Alternating row colors for better readability
      if (index % 2 === 1) {
        doc.setFillColor(248, 248, 248);
        doc.rect(10, yPosition - 5, 190, 10, 'F');
      }
      
      doc.text(product.productName, 15, yPosition);
      doc.text(`${product.quantity}`, 95, yPosition, { align: "center" });
      doc.text(`Rs. ${parseFloat(product.price).toFixed(2)}`, 140, yPosition, { align: "center" });
      doc.text(`Rs. ${(product.quantity * parseFloat(product.price)).toFixed(2)}`, 190, yPosition, { align: "right" });
      yPosition += 10;
    });
    
    // Horizontal line after items
    doc.setDrawColor(220, 220, 220);
    doc.line(10, yPosition + 5, 200, yPosition + 5);
    yPosition += 15;
    
    // Summary section
    const summaryStartY = yPosition;
    
    // Left side section - payment info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("PAYMENT INFORMATION", 15, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text("Thank you for your business.", 15, yPosition + 10);
   
    
    // Right side - totals table
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    
    // Total row
    doc.text("SUBTOTAL:", 140, yPosition);
    doc.text(`Rs. ${calculateTotal().toFixed(2)}`, 190, yPosition, { align: "right" });
    yPosition += 8;
    
    // Discount row
    doc.text("DISCOUNT:", 140, yPosition);
    doc.text(`Rs. ${discount}`, 190, yPosition, { align: "right" });
    yPosition += 8;
    
    // Credit row if applicable
    if (parseFloat(creditAmount) > 0) {
      doc.text("CREDIT:", 140, yPosition);
      doc.text(`Rs. ${creditAmount}`, 190, yPosition, { align: "right" });
      yPosition += 8;
    }
    
    // Amount received row
    doc.text("AMOUNT RECEIVED:", 140, yPosition);
    doc.text(`Rs. ${receivedAmount}`, 190, yPosition, { align: "right" });
    yPosition += 8;
    
    // Change row
    doc.text("CHANGE:", 140, yPosition);
    doc.text(`Rs. ${change.toFixed(2)}`, 190, yPosition, { align: "right" });
    yPosition += 10;
    
    // Final amount due - highlighted
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(110, yPosition - 5, 90, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("BALANCE DUE:", 140, yPosition + 2);
    doc.text(`Rs. 0.00`, 190, yPosition + 2, { align: "right" });
    
    // Footer
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text("Thank you for your purchase!", 105, 280, { align: "center" });
    
    // Save the PDF
    doc.save(`Invoice_${orderDetails.order.orderID || "INV-" + Date.now().toString().slice(-6)}.pdf`);
  };