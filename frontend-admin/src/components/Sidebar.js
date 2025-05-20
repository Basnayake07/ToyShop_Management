"use client";

import React, { useState } from "react";
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, Toolbar,
  Typography, Box, Button, Collapse
} from "@mui/material";
import {
  FaBox, FaClipboardList, FaUsers, FaFileInvoice, FaUserTie, FaChartBar, FaUsersCog
} from "react-icons/fa";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";

const drawerWidth = 240;


const NAVIGATION_ITEMS = [
  { title: "Dashboard", icon: <FaBox />, path: "/Dashboard" },
  { title: "Product", icon: <FaClipboardList />, path: "/Product" },
  { title: "Orders", icon: <FaClipboardList />, path: "/Orders" },
  { title: "Inventory", icon: <FaClipboardList />, path: "/Inventory" },
  {title: "Discounts", icon: <FaClipboardList />, path: "/WholesaleDiscount" },
  { title: "Invoices", icon: <FaFileInvoice />, path: "/Invoice" },
  { title: "Customer Management", icon: <FaUsers />, path: "/Customer" },
  { title: "Employee Management", icon: <FaUserTie />, path: "/Employee" },
  { title: "Supplier Management", icon: <FaUsersCog />, path: "/Supplier" },
  { title: "Purchase Orders", icon: <FaClipboardList />, path: "/PurchaseOrder" },
  { title: "Returns", icon: <FaClipboardList />, path: "/Returns" },
];

const Sidebar = () => {
  const router = useRouter();
  const [openReports, setOpenReports] = useState(false);

  const handleLogout = () => {
    router.push("/Login");
  };

  const handleReportsClick = () => {
    setOpenReports((prev) => !prev);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#212121",
          color: "#fff",
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ textAlign: "center", width: "100%" }}>
          Perera Toyland
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {NAVIGATION_ITEMS.map((item, index) => (
          <ListItemButton component={Link} href={item.path} key={index}>
            <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItemButton>
        ))}
        {/* Reports Section */}
        <ListItemButton onClick={handleReportsClick}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <FaChartBar />
          </ListItemIcon>
          <ListItemText primary="Reports" />
          {openReports ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openReports} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              component={Link}
              href="/InventoryReport"
              sx={{ pl: 4 }}
            >
              <ListItemText primary="Inventory Report" />
            </ListItemButton>
            <ListItemButton
              component={Link}
              href="/SalesReport"
              sx={{ pl: 4 }}
            >
              <ListItemText primary="Sales Report" />
            </ListItemButton>

            {/* discount */}
            

          </List>
        </Collapse>
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ padding: 2 }}>
        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

