export const orderController = {
    // Save a new order
    createOrder: async (req, res) => {
      const { cusID, products, totalPrice } = req.body;
  
      // Validate input data
      if (!cusID || !products || products.length === 0 || totalPrice === undefined) {
        return res.status(400).json({ message: "Customer ID, products, and totalPrice are required." });
      }
  
      try {
        // Generate a new order ID
        const getLastOrderIDQuery = `
          SELECT MAX(CAST(SUBSTRING(orderID, 3) AS UNSIGNED)) AS lastID
          FROM orders
        `;
        const [result] = await req.db.execute(getLastOrderIDQuery);
        const lastID = result[0].lastID || 0;
        const nextOrderID = `OR${lastID + 1}`;
  
        // Insert the order into the `orders` table
        const orderQuery = `
          INSERT INTO orders (orderID, cusID, orderDate, totalPrice, payStatus)
          VALUES (?, ?, CURDATE(), ?, ?)
        `;
        await req.db.execute(orderQuery, [nextOrderID, cusID, totalPrice, "Pending"]);
  
        // Insert the order items into the `orderItems` table
        const orderItemQuery = `
          INSERT INTO orderItems (orderID, productID, quantity, price)
          VALUES (?, ?, ?, ?)
        `;
        for (const product of products) {
          if (!product.productID || product.quantity === undefined || product.price === undefined) {
            return res.status(400).json({ message: "Each product must have productID, quantity, and price." });
          }
          await req.db.execute(orderItemQuery, [nextOrderID, product.productID, product.quantity, product.price]);
        }
  
        res.status(201).json({ message: "Order created successfully", orderID: nextOrderID });
      } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Error creating order", error });
      }
    },
  
  
    // Fetch all orders
    getAllOrders: async (req, res) => {
      try {
        const query = `
          SELECT o.orderID, o.orderDate, o.totalPrice, o.amountPaid, o.creditAmount, o.payStatus, 
                 c.name AS customerName, c.email AS customerEmail
          FROM orders o
          LEFT JOIN customer c ON o.cusID = c.cusID
        `;
        const [orders] = await req.db.execute(query);
        res.status(200).json(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Error fetching orders", error });
      }
    },
  
    // Fetch order details by order ID
    getOrderDetails: async (req, res) => {
      const { orderID } = req.params;
  
      try {
        // Fetch order details
        const orderQuery = `
          SELECT o.orderID, o.orderDate, o.totalPrice, o.amountPaid, o.creditAmount, o.payStatus, 
                 c.name AS customerName, c.email AS customerEmail
          FROM orders o
          LEFT JOIN customer c ON o.cusID = c.cusID
          WHERE o.orderID = ?
        `;
        const [orderDetails] = await req.db.execute(orderQuery, [orderID]);
  
        if (orderDetails.length === 0) {
          return res.status(404).json({ message: "Order not found" });
        }
  
        // Fetch order items
        const orderItemsQuery = `
          SELECT oi.productID, p.name AS productName, oi.quantity, oi.price
          FROM orderItems oi
          LEFT JOIN product p ON oi.productID = p.productID
          WHERE oi.orderID = ?
        `;
        const [orderItems] = await req.db.execute(orderItemsQuery, [orderID]);
  
        res.status(200).json({ order: orderDetails[0], items: orderItems });
      } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ message: "Error fetching order details", error });
      }
    },
    };

