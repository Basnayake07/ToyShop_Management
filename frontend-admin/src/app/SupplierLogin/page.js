'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import validateLogin from '@/components/LoginValidation'; // Reuse the same validation logic
import axios from 'axios';
import Link from 'next/link';

// Material UI components
import { TextField, Button, Typography, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundImage: `url('/assets/images/login.jpg')`, 
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
});

const Overlay = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
});

const StyledPaper = styled(Paper)({
    zIndex: 2,
    padding: '30px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
    backgroundColor: 'rgba(205, 201, 201, 0.9)', 
});

function SupplierLogin() {
    const [values, setValues] = useState({ email: '', password: '' });
    const [isClient, setIsClient] = useState(false);
    const [errors, setErrors] = useState({});
    const router = typeof window !== 'undefined' ? useRouter() : null;

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleInput = (event) => {
        setValues((prev) => ({ ...prev, [event.target.id]: event.target.value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        //const validationErrors = validateLogin(values);
        //setErrors(validationErrors);

        //if (Object.keys(validationErrors).length === 0) {
            axios.post('http://localhost:8081/api/supplier-auth/login', values) // Supplier login endpoint
                .then((res) => {
                    if (res.data.message === 'Login successful') {
                        localStorage.setItem('token', res.data.token);
                        localStorage.setItem('suppID', res.data.suppID);
                        if (isClient && router) {
                            router.push('/SupplierDashboard'); // Redirect to supplier dashboard
                        }
                    } else {
                        alert('Invalid email or password');
                    }
                })
                .catch((err) => {
                    console.error(err);
                    alert('An error occurred. Please try again.');
                });
        //}
    };

    return (
        <StyledContainer>
            <Overlay />
            <StyledPaper elevation={5}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                    Perera Toyland
                </Typography>
                <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
                    Supplier Login
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        variant="outlined"
                        id="email"
                        value={values.email}
                        onChange={handleInput}
                        error={!!errors.email}
                        helperText={errors.email}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        id="password"
                        value={values.password}
                        onChange={handleInput}
                        error={!!errors.password}
                        helperText={errors.password}
                        sx={{ mb: 2 }}
                    />

                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        Log in
                    </Button>
                </form>

                
            </StyledPaper>
        </StyledContainer>
    );
}

export default SupplierLogin;