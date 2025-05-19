export const invoiceController = {
    createInvoice: async (req, res) => {
      const { orderID, receivedAmount, creditAmount, discount } = req.body;
  
      // Validate input data
      if (!orderID || receivedAmount === undefined) {
        return res.status(400).json({ message: "Order ID, received amount, and issued by are required." });
      }
  
      try {
        // Generate a new invoice ID
        const getLastInvoiceIDQuery = `
          SELECT MAX(CAST(SUBSTRING(invoiceID, 3) AS UNSIGNED)) AS lastID
          FROM invoice
        `;
        const [result] = await req.db.execute(getLastInvoiceIDQuery);
        const lastID = result[0].lastID || 0;
        const nextInvoiceID = `IN${lastID + 1}`;
  
// Calculate totalDiscount from orderItems
const [orderItemsForDiscount] = await req.db.execute(
  "SELECT price, discountPrice, quantity FROM orderItems WHERE orderID = ?",
  [orderID]
);
let totalDiscount = 0;
orderItemsForDiscount.forEach(item => {
  if (item.discountPrice !== null) {
    totalDiscount += (item.price - item.discountPrice) * item.quantity;
  }
});

// Insert the invoice into the `invoice` table, now including totalDiscount
const invoiceQuery = `
  INSERT INTO invoice (invoiceID, orderID, issue_date, received_amount, credit_amount, discount, totalDiscount)
  VALUES (?, ?, NOW(), ?, ?, ?, ?)
`;
await req.db.execute(invoiceQuery, [
  nextInvoiceID,
  orderID,
  receivedAmount,
  creditAmount || 0,
  discount || 0,
  totalDiscount.toFixed(2)
]);
  
        // Update the payment status in the `orders` table
        const updateOrderQuery = `
          UPDATE orders
          SET payStatus = ?, deliveryStatus = 'Completed'
          WHERE orderID = ?
        `;
        const payStatus = creditAmount > 0 ? "Partially Paid" : "Paid";
        await req.db.execute(updateOrderQuery, [payStatus, orderID]);
  
        // Fetch the order items to update inventory
        const orderItemsQuery = `
          SELECT productID, quantity
          FROM orderItems
          WHERE orderID = ?
        `;
        const [orderItemsForInventory] = await req.db.execute(orderItemsQuery, [orderID]);
  
        // Update inventory for each product
        const updateInventoryQuery = `
          UPDATE inventory
          SET quantity = quantity - ?
          WHERE productID = ? AND quantity >= ?
        `;
        for (const item of orderItemsForInventory) {
          const { productID, quantity } = item;
  
          // Ensure sufficient stock exists
          const [inventoryCheck] = await req.db.execute(
            "SELECT quantity FROM inventory WHERE productID = ?",
            [productID]
          );
          if (inventoryCheck.length === 0 || inventoryCheck[0].quantity < quantity) {
            return res.status(400).json({ message: `Insufficient stock for product ID: ${productID}` });
          }
  
          // Deduct the quantity
          await req.db.execute(updateInventoryQuery, [quantity, productID, quantity]);
        }
  
        res.status(201).json({ message: "Invoice created and inventory updated successfully", invoiceID: nextInvoiceID });
      } catch (error) {
        console.error("Error creating invoice or updating inventory:", error);
        res.status(500).json({ message: "Error creating invoice or updating inventory", error });
      }
    },
  

  // Fetch invoice details by invoice ID
  getInvoiceDetails: async (req, res) => {
    const { invoiceID } = req.params;

    try {
      // Fetch invoice details
      const invoiceQuery = `
        SELECT i.invoiceID, i.orderID, i.issue_date, i.received_amount, i.credit_amount, i.discount,
               o.totalPrice, o.payStatus, o.deliveryStatus, o.adminID, c.name AS customerName, c.email AS customerEmail
        FROM invoice i
        LEFT JOIN orders o ON i.orderID = o.orderID
        LEFT JOIN customer c ON o.cusID = c.cusID
        WHERE i.invoiceID = ?
      `;
      const [invoiceDetails] = await req.db.execute(invoiceQuery, [invoiceID]);

      if (invoiceDetails.length === 0) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Fetch order items
      const orderItemsQuery = `
        SELECT oi.productID, p.name AS productName, oi.quantity, oi.price
        FROM orderItems oi
        LEFT JOIN product p ON oi.productID = p.productID
        WHERE oi.orderID = ?
      `;
      const [orderItems] = await req.db.execute(orderItemsQuery, [invoiceDetails[0].orderID]);

      res.status(200).json({ invoice: invoiceDetails[0], items: orderItems });
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      res.status(500).json({ message: "Error fetching invoice details", error });
    }
  },

  // Fetch all invoices
getAllInvoices: async (req, res) => {
  try {
    const query = `
      SELECT i.invoiceID, i.orderID, i.issue_date, i.received_amount, i.credit_amount, i.discount,
             o.totalPrice, o.payStatus, o.deliveryStatus, c.name AS customerName, c.email AS customerEmail
      FROM invoice i
      LEFT JOIN orders o ON i.orderID = o.orderID
      LEFT JOIN customer c ON o.cusID = c.cusID
    `;
    const [invoices] = await req.db.execute(query);

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching all invoices:", error);
    res.status(500).json({ message: "Error fetching all invoices", error });
  }
},

  // Update invoice payment status
updateInvoicePayment: async (req, res) => {
  const { invoiceID } = req.params;
  const { additionalPayment } = req.body;

  try {
    // Fetch the current invoice details
    const invoiceQuery = `
      SELECT received_amount, credit_amount, orderID
      FROM invoice
      WHERE invoiceID = ?
    `;
    const [invoiceDetails] = await req.db.execute(invoiceQuery, [invoiceID]);

    if (invoiceDetails.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const { received_amount, credit_amount, orderID } = invoiceDetails[0];

    const currentReceivedAmount = parseFloat(received_amount || 0);
    const currentCreditAmount = parseFloat(credit_amount || 0);
    const additionalPaymentAmount = parseFloat(additionalPayment || 0);

    let newReceivedAmount, newCreditAmount, change = 0;

    if (additionalPaymentAmount >= currentCreditAmount) {
      // Overpayment scenario
      newReceivedAmount = currentReceivedAmount + currentCreditAmount;
      newCreditAmount = 0;
      change = additionalPaymentAmount - currentCreditAmount;
    } else {
      // Normal partial payment
      newReceivedAmount = currentReceivedAmount + additionalPaymentAmount;
      newCreditAmount = currentCreditAmount - additionalPaymentAmount;
    }

    // Update the invoice
    const updateInvoiceQuery = `
      UPDATE invoice
      SET received_amount = ?, credit_amount = ?, issue_date = NOW()
      WHERE invoiceID = ?
    `;
    await req.db.execute(updateInvoiceQuery, [newReceivedAmount, newCreditAmount, invoiceID]);

    // Update the order's payment status if fully paid
    if (newCreditAmount === 0) {
      const updateOrderQuery = `
        UPDATE orders
        SET payStatus = 'Paid'
        WHERE orderID = ?
      `;
      await req.db.execute(updateOrderQuery, [orderID]);
    }

    res.status(200).json({ 
      message: "Invoice payment updated successfully",
      received_amount: newReceivedAmount,
      credit_amount: newCreditAmount,
      change
    });
  } catch (error) {
    console.error("Error updating invoice payment:", error);
    res.status(500).json({ message: "Error updating invoice payment", error });
  }
},


};

export const createInvoiceForOrder = async (db, orderID) => {
  // Generate a new invoice ID
  const getLastInvoiceIDQuery = `
    SELECT MAX(CAST(SUBSTRING(invoiceID, 3) AS UNSIGNED)) AS lastID
    FROM invoice
  `;
  const [result] = await db.execute(getLastInvoiceIDQuery);
  const lastID = result[0].lastID || 0;
  const nextInvoiceID = `IN${lastID + 1}`;

  // Calculate totalDiscount from orderItems
  const [orderItemsForDiscount] = await db.execute(
    "SELECT price, discountPrice, quantity FROM orderItems WHERE orderID = ?",
    [orderID]
  );
  let totalDiscount = 0;
  orderItemsForDiscount.forEach(item => {
    if (item.discountPrice !== null) {
      totalDiscount += (item.price - item.discountPrice) * item.quantity;
    }
  });

  // Get order details for amounts
  const [orderRows] = await db.execute(
    "SELECT totalPrice FROM orders WHERE orderID = ?",
    [orderID]
  );
  if (orderRows.length === 0) throw new Error("Order not found");

  // Insert the invoice
  const invoiceQuery = `
    INSERT INTO invoice (invoiceID, orderID, issue_date, received_amount, credit_amount, discount, totalDiscount)
    VALUES (?, ?, NOW(), ?, 0, 0, ?)
  `;
  await db.execute(invoiceQuery, [
    nextInvoiceID,
    orderID,
    orderRows[0].totalPrice,
    totalDiscount.toFixed(2)
  ]);
};

