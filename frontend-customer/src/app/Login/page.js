"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Button, TextField } from "@mui/material";
import Footer from "@/components/Footer";
import loginImg1 from "@/images/img_login.jpeg";
import { HeaderAuth } from "@/components/HeaderAuth";
import "@/styles/SignIn.css";

const Login = () => {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.id]: event.target.value }));
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  if (!values.email || !values.password) {
    setErrors({ message: "Both fields are required!" });
    alert("Both fields are required!");
    return;
  }

  try {
    const response = await axios.post("http://localhost:8082/api/customers/login", values);

    if (response.data.message === "Login successful") {
      const { cusType, token } = response.data;

      // Store cusType and token
      sessionStorage.setItem("cusType", cusType);
      sessionStorage.setItem("jwtToken", token);

      console.log("Token stored in sessionStorage:", token);
      //localStorage.setItem("cusType", cusType);
      //localStorage.setItem("jwtToken", token);

      alert(response.data.message);
      router.push("/HomePage");
    } else {
      setErrors({ message: response.data.message });
      alert(response.data.message);
    }
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    setErrors({ message: "There was an error with the login. Please try again." });
    alert("There was an error with the login. Please try again.");
  }
};

  return (
    <div className="signIn">
      <HeaderAuth isSignIn={true} />

      <main className="main-signin-content">
        <div className="image-section">
          <Image
            className="login-img"
            alt="Login Illustration"
            src={loginImg1}
            height={600}
            width={500}
          />
        </div>
        <div className="login-form-section">
          <h1 className="form-title">Login</h1>
          <p className="form-subtitle">Enter your details below</p>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                id="email"
                value={values.email}
                onChange={handleInput}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                id="password"
                value={values.password}
                onChange={handleInput}
                className="form-input"
              />
            </div>

            {errors.message && <p className="error-message">{errors.message}</p>}

            <div className="button-container">
              <Button
                disableElevation
                variant="contained"
                className="login-form-button"
                type="submit"
              >
                Login
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
