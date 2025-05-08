import db from "../config/db.js"; 

export const createReturnRequest = async (req, res) => {
    const { orderID, cusID, reason, items } = req.body;
  
    // Validate request body
    if (!orderID || !cusID || !reason || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid request. Please provide all required fields." });
    }
  
    try {
      // Generate the next returnID
      const [lastReturn] = await db.execute(
        `SELECT returnID FROM returnsRequest ORDER BY returnID DESC LIMIT 1`
      );
      const lastID = lastReturn.length > 0 ? lastReturn[0].returnID : "RE00";
      const nextID = `RE${String(parseInt(lastID.slice(2)) + 1).padStart(2, "0")}`;
  
      // Insert into returnsRequest table
      await db.execute(
        `INSERT INTO returnsRequest (returnID, orderID, cusID, requestDate, status, reason)
         VALUES (?, ?, ?, CURDATE(), 'Requested', ?)`,
        [nextID, orderID, cusID, reason]
      );
  
      // Insert into return_items table
      const itemQueries = items.map((item) => {
        if (!item.productID || item.quantity === undefined) {
          throw new Error("Invalid item data. Each item must have a productID and quantity.");
        }
        return db.execute(
          `INSERT INTO return_items (returnID, productID, quantity)
           VALUES (?, ?, ?)`,
          [nextID, item.productID, item.quantity]
        );
      });
  
      await Promise.all(itemQueries);
  
      res.status(201).json({ message: "Return request created successfully", returnID: nextID });
    } catch (error) {
      console.error("Error creating return request:", error);
      res.status(500).json({ message: "Error creating return request", error });
    }
  };

export const updateReturnStatus = async (req, res) => {
    const { returnID } = req.params;
    const { status, note } = req.body;
  
    try {
      // Fetch return items
      const [items] = await db.execute(
        `SELECT productID, quantity FROM return_items WHERE returnID = ?`,
        [returnID]
      );
  
      if (status === "Accepted") {
        // Restock items to inventory
        const restockQueries = items.map((item) =>
          db.execute(
            `UPDATE inventory SET quantity = quantity + ? WHERE productID = ?`,
            [item.quantity, item.productID]
          )
        );
        await Promise.all(restockQueries);
      } else if (status === "Unaccepted") {
        // Add items to returns table
        const storageQueries = items.map((item) =>
          db.execute(
            `INSERT INTO returns (productID, quantity, note)
             VALUES (?, ?, ?)`,
            [item.productID, item.quantity, note || "Unaccepted return"]
          )
        );
        await Promise.all(storageQueries);
      }
  
      // Update return status
      await db.execute(
        `UPDATE returnsRequest SET status = ?, decisionDate = CURDATE() WHERE returnID = ?`,
        [status, returnID]
      );
  
      res.status(200).json({ message: "Return status updated successfully" });
    } catch (error) {
      console.error("Error updating return status:", error);
      res.status(500).json({ message: "Error updating return status", error });
    }
  };

  export const getAllReturns = async (req, res) => {
    try {
      const [returns] = await db.execute(
        `SELECT r.returnID, r.orderID, r.cusID, r.requestDate, r.status, r.reason, r.decisionDate,
                c.name, o.totalPrice
         FROM returnsRequest r
         JOIN customer c ON r.cusID = c.cusID
         JOIN orders o ON r.orderID = o.orderID`
      );
  
      res.status(200).json(returns);
    } catch (error) {
      console.error("Error fetching return requests:", error);
      res.status(500).json({ message: "Error fetching return requests", error });
    }
  };

  export const getReturnDetails = async (req, res) => {
    const { returnID } = req.params;
  
    try {
      const [returnDetails] = await db.execute(
        `SELECT r.returnID, r.orderID, r.cusID, r.requestDate, r.status, r.reason, r.decisionDate,
                c.name, o.totalPrice
         FROM returnsRequest r
         JOIN customer c ON r.cusID = c.cusID
         JOIN orders o ON r.orderID = o.orderID
         WHERE r.returnID = ?`,
        [returnID]
      );
  
      const [items] = await db.execute(
        `SELECT ri.productID, p.name, ri.quantity
         FROM return_items ri
         JOIN product p ON ri.productID = p.productID
         WHERE ri.returnID = ?`,
        [returnID]
      );
  
      res.status(200).json({ returnDetails: returnDetails[0], items });
    } catch (error) {
      console.error("Error fetching return details:", error);
      res.status(500).json({ message: "Error fetching return details", error });
    }
  };

  export const getReturnedProducts = async (req, res) => {
    try {
      console.log("Executing getReturnedProducts query...");
      const [returnedProducts] = await db.execute(
        `SELECT r.id, r.productID, p.name AS productName, r.quantity, r.note, r.addedAt
FROM returns r
JOIN product p ON r.productID = p.productID`
      );
  
      console.log("Returned Products Query Result:", returnedProducts);
      if (returnedProducts.length === 0) {
        console.log("No returned products found");
        return res.status(200).json({ items: [] });
      }
  
      res.status(200).json({ items: returnedProducts });
    } catch (error) {
      console.error("Error fetching returned products:", error);
      res.status(500).json({ message: "Error fetching returned products", error });
    }
  };