"use client";

import React from "react";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, Toolbar, Typography } from "@mui/material";
import { FaBox, FaClipboardList, FaUsers, FaFileInvoice, FaUserTie, FaChartBar, FaUsersCog } from "react-icons/fa";
import Link from "next/link";

const drawerWidth = 240;

const NAVIGATION_ITEMS = [
  { title: "Dashboard", icon: <FaBox />, path: "/Dashboard" },
  { title: "Product", icon: <FaClipboardList />, path: "/Product" },
  { title: "Orders", icon: <FaClipboardList />, path: "/Orders" },
  { title: "Inventory", icon: <FaClipboardList />, path: "/Inventory" },
  { title: "Invoices", icon: <FaFileInvoice />, path: "/invoices" },
  { title: "Customer Management", icon: <FaUsers />, path: "/Customer" },
  { title: "Employee Management", icon: <FaUserTie />, path: "/Employee" },
  { title: "Supplier Management", icon: <FaUsersCog />, path: "/Supplier" },
  { title: "Reports", icon: <FaChartBar />, path: "/reports" },
];

const Sidebar = () => {
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
      </List>
    </Drawer>
  );
};

export default Sidebar;

