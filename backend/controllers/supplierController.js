import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email.js";

export const supplierController = {
  // Create a new supplier
  createSupplier: async (req, res) => {
    const { name, email, password, phoneNumbers } = req.body;

    // Validate input fields
    if (!name || !email || !password || !phoneNumbers || phoneNumbers.length === 0) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Validate role from token
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(403).json({ message: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

      if (decoded.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Only admins can register suppliers." });
      }

      // Generate the next supplier ID (e.g., SUP1, SUP2, ...)
      const getLastIDQuery = `
        SELECT MAX(CAST(SUBSTRING(suppID, 4) AS UNSIGNED)) AS lastID
        FROM supplier
      `;
      const [result] = await req.db.execute(getLastIDQuery);
      const lastID = result[0].lastID || 0;
      const nextSuppID = `SUP${lastID + 1}`;

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert into supplier table
      const insertSupplierQuery = `
        INSERT INTO supplier (suppID, name, email, password)
        VALUES (?, ?, ?, ?)
      `;
      await req.db.execute(insertSupplierQuery, [nextSuppID, name, email, hashedPassword]);

      // Insert phone numbers into supp_phone table
      const phoneQuery = `
        INSERT INTO supp_phone (suppID, phoneNumber)
        VALUES (?, ?)
      `;
      for (const phone of phoneNumbers) {
        await req.db.execute(phoneQuery, [nextSuppID, phone]);
      }

      res.status(201).json({ message: "Supplier registered successfully", suppID: nextSuppID });
    } catch (error) {
      console.error("Error registering supplier:", error);
      res.status(500).json({ message: "Server error during supplier registration", error });
    }
  },

  // Get all suppliers
  getAllSuppliers: async (req, res) => {
    try {
      const query = `
        SELECT s.suppID, s.name, s.email, GROUP_CONCAT(p.phoneNumber) AS phoneNumbers
        FROM supplier s
        LEFT JOIN supp_phone p ON s.suppID = p.suppID
        GROUP BY s.suppID
      `;
      const [suppliers] = await req.db.execute(query);
      res.status(200).json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Error fetching suppliers", error });
    }
  },

  createPurchaseOrder: async (req, res) => {
    console.log("Request Body:", req.body); // Debugging: Log the request body
    const { suppID, items, total, status } = req.body;
    
  
    // Validate input data
    if (!suppID || !items || items.length === 0 || total === undefined || status === undefined) {
      return res.status(400).json({ message: "Supplier ID, items, total, and status are required." });
    }
  
    try {
      // Generate a new purchase ID
      const getLastPurchaseIDQuery = `
        SELECT MAX(CAST(SUBSTRING(purchaseID, 3) AS UNSIGNED)) AS lastID
        FROM purchaseOrder
      `;
      const [result] = await req.db.execute(getLastPurchaseIDQuery);
      const lastID = result[0].lastID || 0;
      const nextPurchaseID = `PO${lastID + 1}`;
  
      // Insert purchase order
      const purchaseOrderQuery = `
        INSERT INTO purchaseOrder (purchaseID, suppID, purchaseDate, total, status)
        VALUES (?, ?, CURDATE(), ?, ?)
      `;
      await req.db.execute(purchaseOrderQuery, [nextPurchaseID, suppID, total, status || "Pending"]);
  
      // Insert purchase order items
      const purchaseOrderItemQuery = `
        INSERT INTO purchaseOrderItem (purchaseID, productID, quantity, cost)
        VALUES (?, ?, ?, ?)
      `;
      for (const item of items) {
        if (!item.productID || item.quantity === undefined || item.cost === undefined) {
          return res.status(400).json({ message: "Each item must have productID, quantity, and cost." });
        }
        await req.db.execute(purchaseOrderItemQuery, [
          nextPurchaseID,
          item.productID,
          item.quantity,
          item.cost,
        ]);
      }
  

      // Fetch supplier details
    const supplierQuery = `SELECT name, email FROM supplier WHERE suppID = ?`;
    const [[supplier]] = await req.db.execute(supplierQuery, [suppID]);

    // Prepare the email content
    const itemsList = items
      .map((item) => `- Product ID: ${item.productID}, Quantity: ${item.quantity}, Unit Cost: Rs. ${item.cost}`)
      .join("\n");

    const emailText = `
        Dear ${supplier.name},

        You have received a new purchase order. Here are the details:

        Order ID: ${nextPurchaseID}
        Date: ${new Date().toLocaleDateString()}

        Products:
        ${itemsList}

        Total Cost: Rs. ${total}

        Thank you for your continued partnership!

        Best regards,
        Perera Toyland
        `;

    // Send the email
    await sendEmail({
      to: supplier.email,
      subject: `New Purchase Order from Perera Toyland`,
      text: emailText,
    });

    console.log("✅ Email sent to supplier:", supplier.email);

      res.status(201).json({ message: "Purchase order created successfully" });
    } catch (error) {
      console.error("Error creating purchase order:", error);
      res.status(500).json({ message: "Error creating purchase order", error });
    }
  },

  // Get all purchase orders
  getAllPurchaseOrders: async (req, res) => {
    try {
      const query = `
        SELECT po.purchaseID, po.purchaseDate AS orderDate, po.total, po.status, po.comments, po.feedback,
               s.suppID, s.name AS supplierName
        FROM purchaseOrder po
        LEFT JOIN supplier s ON po.suppID = s.suppID
      `;
      const [orders] = await req.db.execute(query);
  
      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ message: "Error fetching purchase orders", error });
    }
  },

  // Get purchase orders by supplier ID
  getPurchaseOrderDetails: async (req, res) => {
    const { purchaseID } = req.params;
  
    try {
      const query = `
        SELECT po.purchaseID, po.purchaseDate AS orderDate, po.total, po.status, 
               poi.productID, p.name AS productName, poi.quantity, poi.cost, 
               s.suppID, s.name AS supplierName
        FROM purchaseOrder po
        LEFT JOIN purchaseOrderItem poi ON po.purchaseID = poi.purchaseID
        LEFT JOIN product p ON poi.productID = p.productID
        LEFT JOIN supplier s ON po.suppID = s.suppID
        WHERE po.purchaseID = ?
      `;
      const [orders] = await req.db.execute(query, [purchaseID]);
  
      if (orders.length === 0) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
  
      // Group items for the purchase order
      const { purchaseID: id, orderDate, total, status, supplierName, suppID } = orders[0];
      const items = orders.map((order) => ({
        productID: order.productID,
        productName: order.productName,
        quantity: order.quantity,
        cost: order.cost,
      }));
  
      const purchaseOrder = {
        purchaseID: id,
        orderDate,
        total,
        status,
        supplierName,
        suppID,
        items,
      };
  
      res.status(200).json(purchaseOrder);
    } catch (error) {
      console.error("Error fetching purchase order details:", error);
      res.status(500).json({ message: "Error fetching purchase order details", error });
    }
  },

  // Update purchase order status

    updatePurchaseOrderFeedback: async (req, res) => {
      const { purchaseID } = req.params;
      const { feedback } = req.body;

      try {
        const query = `
          UPDATE purchaseOrder
          SET feedback = ?
          WHERE purchaseID = ?
        `;
        await req.db.execute(query, [feedback, purchaseID]);
        res.status(200).json({ message: "Feedback updated successfully" });
      } catch (error) {
        console.error("Error updating feedback:", error);
        res.status(500).json({ message: "Error updating feedback", error });
      }
    }
};
