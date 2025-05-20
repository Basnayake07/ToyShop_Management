CREATE DATABASE toyshop;

-- Use the toyshop database
USE toyshop;

CREATE TABLE admin (
    adminID VARCHAR(10) PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    address VARCHAR(50) NOT NULL,
    email VARCHAR(30) NOT NULL,
    role VARCHAR(10) NOT NULL,
    password VARCHAR(100) NOT NULL
);


CREATE TABLE emp_phone (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    adminID VARCHAR(10),
    phoneNumber VARCHAR(20),
    FOREIGN KEY (adminID) REFERENCES admin(adminID) ON DELETE CASCADE
);

CREATE TABLE product (
    productID VARCHAR(8) NOT NULL,
    name VARCHAR(30) NOT NULL,
    category ENUM('Christmas Deco', 'Birthday Deco', 'Soft Toys', 'Other Toys', 'Educational Toys') NOT NULL,
    description TEXT DEFAULT NULL,
    image VARCHAR(100) DEFAULT NULL,
    ageGrp ENUM('0-12 months', '1-4 years', '4-8 years', '12+ years') DEFAULT NULL,
    totalRating FLOAT DEFAULT 0,
    ratingCount INT DEFAULT 0,
    productRating FLOAT DEFAULT 0,
    PRIMARY KEY (productID)
);

CREATE TABLE inventory (
    batchID Varchar(10) NOT NULL ,
    productID VARCHAR(8) NOT NULL,
    receivedDate DATE NOT NULL,
    quantity INT(8) NOT NULL,
    cost DECIMAL(7,2) NOT NULL,
    wholesalePrice DECIMAL(7,2) NOT NULL,
    retailPrice DECIMAL(7,2) NOT NULL,
    minStock TINYINT(5) NOT NULL,
    availability TINYINT(1) DEFAULT 1,
    PRIMARY KEY (batchID, productID),
    FOREIGN KEY (productID) REFERENCES product(productID) 
);

CREATE TABLE customer (
    cusID varchar(10) PRIMARY KEY ,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50)  NOT NULL,
    cusType ENUM('Wholesale', 'Retail') NOT NULL,
    adminID varchar(10) Null,
    password varchar(100) null,
    streetNo VARCHAR(30)  NULL,
    village VARCHAR(50)  NULL,
    city VARCHAR(30)  NULL,
    postalCode VARCHAR(10)  NULL;
    FOREIGN KEY (adminID) REFERENCES admin(adminID) ON DELETE SET null
);

CREATE TABLE cus_phone (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cusID varchar(10),
    phoneNumber VARCHAR(15) NOT NULL,
    FOREIGN KEY (cusID) REFERENCES customer(cusID) ON DELETE CASCADE
);

ALTER TABLE customer
MODIFY password varchar(100) NULL;

CREATE TABLE orders (
    orderID VARCHAR(6) PRIMARY KEY,
    cusID varchar(10),
    orderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    totalPrice DECIMAL(10,2),
    payStatus ENUM('Pending', 'Paid', 'Cancelled'),
    deliveryStatus ENUM('Pending', 'Completed', 'Delivered', 'Cancelled')
	paymentMethod ENUM('COD', 'Stripe'),
    adminID varchar(10) Null,
    FOREIGN KEY (cusID) REFERENCES customer(cusID),
    FOREIGN KEY (adminID) REFERENCES admin(adminID)
);

CREATE TABLE orderitems (
    orderItemID INT PRIMARY KEY AUTO_INCREMENT,
    orderID VARCHAR(6),
    productID VARCHAR(8) NOT NULL,
    quantity INT,
    price DECIMAL(10,2),
    discountPrice DECIMAL (5,2) NULL,
    FOREIGN KEY (orderID) REFERENCES orders(orderID),
    FOREIGN KEY (productID) REFERENCES product(productID)
);

CREATE TABLE purchaseOrder (
    purchaseID VARCHAR(6) PRIMARY KEY ,
    suppID VARCHAR(6) NOT NULL,
    purchaseDate DATE NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    comments TEXT NULL,
    feedback TEXT NULL,
    status ENUM ('Pending', 'Received', 'Cancelled'),
    FOREIGN KEY (suppID) REFERENCES supplier(suppID)
);

CREATE TABLE purchaseOrderItem (
    purchaseItem INT  AUTO_INCREMENT,
    purchaseID VARCHAR(6) NOT NULL ,
    productID VARCHAR(8) NOT NULL,
    quantity INT(8) NOT NULL,
    cost DECIMAL(7,2) NOT NULL,
    primary key (purchaseItem, purchaseID),
    FOREIGN KEY (purchaseID) REFERENCES purchaseOrder(purchaseID),
    FOREIGN KEY (productID) REFERENCES product(productID) 
);

CREATE TABLE invoice (
  invoiceID VARCHAR(6) PRIMARY KEY,
  orderID VARCHAR(6),
  issue_date DATETIME,
  received_amount DECIMAL(10,2),
  credit_amount DECIMAL(10,2),
  totalDiscount DECIMAL(5,2) NULL,
  FOREIGN KEY (orderID) REFERENCES orders(orderID)
);

CREATE TABLE returnsRequest (
  returnID VARCHAR(6) PRIMARY KEY,
  orderID VARCHAR(6) NOT NULL,
  cusID VARCHAR(10),
  requestDate DATE NOT NULL,
  status ENUM('Requested', 'Accepted', 'Unaccepted', 'Rejected') DEFAULT 'Requested',
  reason TEXT,
  decisionDate DATE,
  FOREIGN KEY (orderID) REFERENCES orders(orderID),
  FOREIGN KEY (cusID) REFERENCES customer(cusID)
);

CREATE TABLE return_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  returnID VARCHAR (6),
  productID VARCHAR(8),
  quantity INT NOT NULL,
  FOREIGN KEY (returnID) REFERENCES returnsRequest(returnID),
  FOREIGN KEY (productID) REFERENCES product(productID)
);

CREATE TABLE returns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productID VARCHAR(8),
  quantity INT NOT NULL,
  note TEXT,
  addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productID) REFERENCES product(productID)
);

CREATE TABLE wishlist (
  WishlistID INT AUTO_INCREMENT PRIMARY KEY,
  cusID VARCHAR(10),
  productID VARCHAR(8),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cusID) REFERENCES customer(cusID),
  FOREIGN KEY (productID) REFERENCES product(productID)
);

CREATE TABLE product_review (
  reviewID INT AUTO_INCREMENT PRIMARY KEY,
  productID VARCHAR(8),
  cusID VARCHAR(10),
  customerRating FLOAT DEFAULT 0,
  comment VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productID) REFERENCES product(productID),
  FOREIGN KEY (cusID) REFERENCES customer(cusID)
);

CREATE VIEW LowStockProducts AS
SELECT 
    p.productID, 
    p.name AS product_name,
    p.category,
    i.quantity,
    i.minStock,
    COALESCE(SUM(i.quantity), 0) AS totalStock
FROM product p
LEFT JOIN inventory i ON p.productID = i.productID
GROUP BY p.productID, p.name, p.category, i.minStock, i.quantity
HAVING quantity <= i.minStock;

DROP VIEW LowStockProducts;

CREATE VIEW PartiallyPaidCustomers AS
SELECT
    c.cusID,
    c.name,
    cp.phoneNumber,
    c.cusType,
    o.orderID,
    i.invoiceID,
    i.received_amount,
    i.credit_amount,
    i.discount,
    i.issue_date
FROM
    customer c
    JOIN orders o ON c.cusID = o.cusID
    JOIN invoice i ON o.orderID = i.orderID
    LEFT JOIN cus_phone cp ON c.cusID = cp.cusID
WHERE
    i.received_amount > 0
    AND i.credit_amount > 0;

CREATE TABLE wholesale_discounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productID VARCHAR(8) NOT NULL,
    discountQuantity INT NOT NULL,
    discount_percent DECIMAL(5,2) NOT NULL,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    FOREIGN KEY (productID) REFERENCES product(productID)
);

SELECT discount_percent FROM wholesale_discounts
      WHERE productID = ? AND discountQuantity <= ? AND 
            (start_date IS NULL OR start_date <= ?) AND 
            (end_date IS NULL OR end_date >= ?)
      ORDER BY discountQuantity DESC LIMIT 1
    
