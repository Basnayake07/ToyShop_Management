export const supplierController = {
  // Create a new supplier
  createSupplier: async (req, res) => {
    const { suppID, name, email, phoneNumbers } = req.body;

    try {
      // Insert supplier details
      const supplierQuery = `
        INSERT INTO supplier (suppID, name, email)
        VALUES (?, ?, ?)
      `;
      await req.db.execute(supplierQuery, [suppID, name, email]);

      // Insert phone numbers
      const phoneQuery = `
        INSERT INTO supp_phone (suppID, phoneNumber)
        VALUES (?, ?)
      `;
      for (const phone of phoneNumbers) {
        await req.db.execute(phoneQuery, [suppID, phone]);
      }

      res.status(201).json({ message: "Supplier created successfully" });
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Error creating supplier", error });
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
  
      res.status(201).json({ message: "Purchase order created successfully" });
    } catch (error) {
      console.error("Error creating purchase order:", error);
      res.status(500).json({ message: "Error creating purchase order", error });
    }
  },

  // Get purchase orders by supplier ID
  getPurchaseOrdersBySupplier: async (req, res) => {
    const { suppID } = req.params;

    try {
      // Get purchase orders for the supplier
      const orderQuery = `
        SELECT po.purchaseID, po.purchaseDate, po.total, po.status, 
               poi.productID, poi.quantity, poi.cost
        FROM purchaseOrder po
        LEFT JOIN purchaseOrderItem poi ON po.purchaseID = poi.purchaseID
        WHERE po.suppID = ?
      `;
      const [orders] = await req.db.execute(orderQuery, [suppID]);

      // Group items by purchase ID
      const groupedOrders = orders.reduce((acc, order) => {
        const { purchaseID, purchaseDate, total, status, productID, quantity, cost } = order;
        if (!acc[purchaseID]) {
          acc[purchaseID] = {
            purchaseID,
            purchaseDate,
            total,
            status,
            items: [],
          };
        }
        acc[purchaseID].items.push({ productID, quantity, cost });
        return acc;
      }, {});

      res.status(200).json(Object.values(groupedOrders));
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ message: "Error fetching purchase orders", error });
    }
  },
};