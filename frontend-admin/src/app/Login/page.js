'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import validateLogin from '@/components/LoginValidation';
import axios from 'axios';
import Link from 'next/link';
import '@/styles/Login.css';

function Login() {
    const [values, setValues] = useState({
        email: '',
        password: ''
    });

    const [isClient, setIsClient] = useState(false);
    const [errors, setErrors] = useState({});
    const router = typeof window !== 'undefined' ? useRouter() : null;

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleInput = (event) => {
        setValues(prev => ({...prev, [event.target.id]: event.target.value}));
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const validationErrors = validateLogin(values);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            axios.post('http://localhost:8081/api/auth/login', values)
            .then(res => {
                console.log(res.data);
                if(res.data.message === "Login successful") {
                    // Save the token in local storage
                    localStorage.setItem('token', res.data.token);
                    if (isClient && router) {
                        router.push('/Dashboard');
                    }
                } else {
                    alert("Invalid email or password");
                }
            })
            .catch(err => {
                console.log(err);
                alert("An error occurred. Please try again.");
            });
        }
    }

    return (
        <div className="login-container">
            <div className="overlay"></div>
            <h1 className="shop-name" style={{zIndex:2}}>Perera Toyland</h1>

            <div className='d-flex justify-content-center align-items-center' style={{height: '100vh', zIndex: 2}}>
                <div className='bg-white p-3 rounded w-200'>
                    <h2 className='text-center'>Log in</h2>
                    <form onSubmit={handleSubmit}>
                        <div className='mb-3'>
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" placeholder="Enter email" required name='email'
                            onChange={handleInput} className='form-control rounded-0'/>
                            {errors.email && <span className='text-danger'>{errors.email}</span>}
                        </div>

                        <div className='mb-3'>
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" placeholder="Enter password" required name='password'
                            onChange={handleInput} className='form-control rounded-0' />
                            {errors.password && <span className='text-danger'>{errors.password}</span>}
                        </div>
                        
                        <button type='submit' className='btn btn-success w-100 rounded-0'><strong>Log in</strong></button>
                        <p>Don’t have an account?</p>
                        <Link href="/signup" className='btn btn-default border w-100 bg-light text-decoration-none'>Register</Link>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login;
