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
    ageGrp ENUM('0-12 months', '1-3 years', '4-8 years', '12+ years') DEFAULT NULL,
    PRIMARY KEY (productID)
);

CREATE TABLE inventory (
    batchID VARCHAR (20) NOT NULL,
    productID VARCHAR(8) NOT NULL,
    receivedDate DATE NOT NULL,
    quantity INT(8) NOT NULL,
    cost DECIMAL(7,2) NOT NULL,
    wholesalePrice DECIMAL(7,2) NOT NULL,
    retailPrice DECIMAL(7,2) NOT NULL,
    minStock TINYINT(5) NOT NULL,
    minProfitMargin DECIMAL(5,2) NOT NULL,
    PRIMARY KEY (productID, batchID),
    FOREIGN KEY (productID) REFERENCES product(productID) ON DELETE CASCADE
);

CREATE TABLE customer (
    cusID varchar(10) PRIMARY KEY ,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50)  NOT NULL,
    cusType ENUM('Wholesale', 'Retail') NOT NULL,
    adminID varchar(10) Null,
    password varchar(100) Not null,
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
    orderID VARCHAR(6) PRIMARY KEY AUTO_INCREMENT,
    cusID varchar(10),
    orderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    totalPrice DECIMAL(10,2),
    payStatus ENUM('Pending', 'Paid', 'Cancelled'),
    adminID varchar(10) Null,
    FOREIGN KEY (cusID) REFERENCES customer(cusID),
    FOREIGN KEY (adminID) REFERENCES admin(adminID)
);

CREATE TABLE order_items (
    orderItemID INT PRIMARY KEY AUTO_INCREMENT,
    orderID VARCHAR(6),
    productID VARCHAR(8) NOT NULL,
    quantity INT,
    price DECIMAL(10,2),
    FOREIGN KEY (orderID) REFERENCES orders(orderID),
    FOREIGN KEY (productID) REFERENCES products(productID)
);

CREATE TABLE supplier (
  suppID VARCHAR(6) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL
);

CREATE TABLE supp_phone (
  id INT AUTO_INCREMENT PRIMARY KEY,
  suppID VARCHAR(6),
  phoneNumber VARCHAR(15),
  FOREIGN KEY (suppID) REFERENCES supplier(suppID)
);

CREATE TABLE purchaseOrder (
    purchaseID VARCHAR(6) PRIMARY KEY ,
    suppID VARCHAR(6) NOT NULL,
    purchaseDate DATE NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    comments TEXT NULL,
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
  discount DECIMAL(10,2),
  FOREIGN KEY (orderID) REFERENCES orders(orderID)
);