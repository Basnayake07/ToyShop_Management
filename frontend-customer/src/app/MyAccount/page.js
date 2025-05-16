'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/Header";
import Footer from '@/components/Footer';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { Button, TextField, MenuItem } from "@mui/material";
import { getUserDetails, updateUserDetails, getCustomerOrders } from '@/services/userService'; 
import AlertComponent from '@/components/AlertComponent';
import { Sidebar } from '@/components/Sidebar'; 
import '@/styles/MyAccount.css';

const cusTypeOptions = [
  { value: 'Wholesale', label: 'Wholesale' },
  { value: 'Retail', label: 'Retail' }
];

const MyAccount = () => {
  const router = useRouter();
  const [user, setUser] = useState({
    name: '',
    email: '',
    cusType: '',
    phoneNumbers: ['']
  });
  const [orders, setOrders] = useState([]);
  const [alert, setAlert] = useState({ severity: '', title: '', message: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      router.push('/SignIn');
    } else {
      setIsAuthenticated(true);
      getUserDetails()
        .then((data) => {
          setUser({
            name: data.name || '',
            email: data.email || '',
            cusType: data.cusType || '',
            phoneNumbers: data.phoneNumbers && data.phoneNumbers.length > 0 ? data.phoneNumbers : ['']
          });
        })
        .catch((error) => {
          setAlert({ severity: 'error', title: 'Error', message: error.message });
        });

         // Fetch orders
      getCustomerOrders()
        .then(setOrders)
        .catch((error) => {
          setAlert({ severity: 'error', title: 'Error', message: error.message });
        });
    }
  }, [router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleEdit = () => setIsEditable(true);

  const handleSaveChanges = async () => {
    try {
      // Remove empty phone numbers
      const filteredPhones = user.phoneNumbers.filter(p => p.trim() !== '');
      await updateUserDetails({ ...user, phoneNumbers: filteredPhones });
      setIsEditable(false);
      setAlert({ severity: 'success', title: 'Success', message: 'User details updated successfully!' });
    } catch (error) {
      setAlert({ severity: 'error', title: 'Error', message: error.message });
    }
  };

  const closeAlert = () => setAlert({ severity: '', title: '', message: '' });

  const handlePhoneChange = (idx, value) => {
    const updatedPhones = [...user.phoneNumbers];
    updatedPhones[idx] = value;
    setUser({ ...user, phoneNumbers: updatedPhones });
  };

  const handleAddPhone = () => {
    setUser({ ...user, phoneNumbers: [...user.phoneNumbers, ''] });
  };

  const handleRemovePhone = (idx) => {
    const updatedPhones = user.phoneNumbers.filter((_, i) => i !== idx);
    setUser({ ...user, phoneNumbers: updatedPhones.length ? updatedPhones : [''] });
  };

  return (
    <div className="myaccount-all">
      <Header isHomePage={true}/>
      <main className="main-myaccount-content" style={{ display: 'flex', gap: '32px' }}>
        <div className="sidebar-section" style={{ minWidth: 250 }}>
          <Sidebar />
        </div>
        <div className='user-form' style={{ flex: 1 }}>
          <center>
            <Stack direction="row" style={{ justifyContent: 'center', marginBottom: '5%' }}>
              <Avatar sx={{ bgcolor: '#0A2F6E', width: 70, height: 70 }}>
                {user.name.charAt(0)}
              </Avatar>
            </Stack>
          </center>
          <form>
            <div className='user-details'>
              <div className='user-details-text'>
                <TextField
                  label="Name"
                  name="name"
                  type="text"
                  variant="outlined"
                  fullWidth
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  disabled={!isEditable}
                />
              </div>
              <div className='user-details-text'>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  variant="outlined"
                  value={user.email}
                  disabled = {!isEditable}
                  fullWidth
                />
              </div>
            </div>
            <div className='user-details'>
              <div className='user-details-text'>
                <TextField
                  select
                  label="Customer Type"
                  name="cusType"
                  value={user.cusType}
                  onChange={(e) => setUser({ ...user, cusType: e.target.value })}
                  disabled={!isEditable}
                  fullWidth
                >
                  {cusTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </TextField>
              </div>
            </div>
            <div className='user-details'>
              <div className='user-details-text'>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Phone Numbers</label>
                {user.phoneNumbers.map((phone, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <TextField
                      type="text"
                      value={phone}
                      onChange={e => handlePhoneChange(idx, e.target.value)}
                      disabled={!isEditable}
                      style={{ marginRight: 8 }}
                    />
                    {isEditable && user.phoneNumbers.length > 1 && (
                      <Button variant="outlined" color="error" onClick={() => handleRemovePhone(idx)}>-</Button>
                    )}
                  </div>
                ))}
                {isEditable && (
                  <Button variant="outlined" onClick={handleAddPhone}>Add Phone</Button>
                )}
              </div>
            </div>
            <div className='myaccount-buttons'>
              {!isEditable ? (
                <Button
                  variant="contained"
                  className="form-button"
                  onClick={handleEdit}
                >
                  Edit
                </Button>
              ) : (
                <Button
                  variant="contained"
                  className="form-button"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </Button>
              )}
            </div>
          </form>
              <hr style={{ margin: '32px 0' }} />
<h2>Order History</h2>
{orders.length === 0 ? (
  <p>No orders found.</p>
) : (
  <div className="order-history">
    {orders.map(order => (
      <div key={order.orderID} className="order-card" style={{ border: '1px solid #eee', borderRadius: 8, marginBottom: 16, padding: 16 }}>
        <div><b>Order ID:</b> {order.orderID}</div>
        <div><b>Date:</b> {new Date(order.orderDate).toLocaleString()}</div>
        <div><b>Status:</b> {order.payStatus}</div>
        <div><b>Total:</b> Rs. {order.totalPrice}</div>
        <div>
          <b>Items:</b>
          <ul>
            {order.items.map(item => (
              <li key={item.orderItemID}>
                {item.productName} (x{item.quantity}) - Rs. {item.price}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ))}
  </div>
)}

        </div>
      </main>
      <Footer />
      {alert.message && (
        <AlertComponent
          severity={alert.severity}
          title={alert.title}
          message={alert.message}
          onClose={closeAlert}
          sx={{ width: '25%', position: 'fixed', top: '10%', left: '75%', zIndex: 9999 }}
        />
      )}
    </div>
  );
};

export default MyAccount;
