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
  
        // Insert the invoice into the `invoice` table
        const invoiceQuery = `
          INSERT INTO invoice (invoiceID, orderID, issue_date, received_amount, credit_amount, discount)
          VALUES (?, ?, NOW(), ?, ?, ?)
        `;
        await req.db.execute(invoiceQuery, [nextInvoiceID, orderID, receivedAmount, creditAmount || 0, discount || 0]);
  
        // Update the payment status in the `orders` table
        const updateOrderQuery = `
          UPDATE orders
          SET payStatus = ?
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
        const [orderItems] = await req.db.execute(orderItemsQuery, [orderID]);
  
        // Update inventory for each product
        const updateInventoryQuery = `
          UPDATE inventory
          SET quantity = quantity - ?
          WHERE productID = ? AND quantity >= ?
        `;
        for (const item of orderItems) {
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
               o.totalPrice, o.payStatus, o.adminID, c.name AS customerName, c.email AS customerEmail
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
};