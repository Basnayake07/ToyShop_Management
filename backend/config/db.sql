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
    productID VARCHAR(8) NOT NULL,
    receivedDate DATE NOT NULL,
    quantity INT(8) NOT NULL,
    cost DECIMAL(7,2) NOT NULL,
    wholesalePrice DECIMAL(7,2) NOT NULL,
    retailPrice DECIMAL(7,2) NOT NULL,
    minStock TINYINT(5) NOT NULL,
    minProfitMargin DECIMAL(5,2) NOT NULL,
    PRIMARY KEY (productID, receivedDate),
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
