"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from "@mui/material";
import OTPInput from "react-otp-input";
import Footer from "@/components/Footer";
import loginImg1 from "@/images/img_login.jpeg";
import { HeaderAuth } from "@/components/HeaderAuth";
import "@/styles/SignIn.css";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cusType, setCusType] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState([""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handlePhoneNumberChange = (index, value) => {
    const updatedPhoneNumbers = [...phoneNumbers];
    updatedPhoneNumbers[index] = value;
    setPhoneNumbers(updatedPhoneNumbers);
  };

  const addPhoneNumberField = () => {
    setPhoneNumbers([...phoneNumbers, ""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validations
    if (!name || !email || !password || !cusType || phoneNumbers.some((num) => !num)) {
      setErrorMessage("All fields are required!");
      alert("All fields are required!");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage("Invalid email format!");
      alert("Invalid email format!");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long!");
      alert("Password must be at least 8 characters long!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8082/api/customers/signup", {
        name,
        email,
        password,
        cusType,
        phoneNumbers,
      });

      if (response.data.success) {
        alert(response.data.message);
        setIsModalOpen(true); // Open the modal for OTP verification
      } else {
        setErrorMessage(response.data.message);
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setErrorMessage("There was an error with the sign-up. Please try again.");
      alert("There was an error with the sign-up. Please try again.");
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await axios.post("http://localhost:8082/api/customers/verify-otp", {
        name,
        email,
        password,
        cusType,
        phoneNumbers,
        otp: verificationCode,
      });

      if (response.data.message === "Customer registered successfully") {
        alert(response.data.message);
        router.push("/Login");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("There was an error verifying the code. Please try again.");
    }
  };

  return (
    <div className="signIn">
      <HeaderAuth isSignIn={false} />

      <main className="main-signin-content">
        <div className="image-section">
          <Image className="login-img" alt="Login Illustration" src={loginImg1} height={600} width={500} />
        </div>
        <div className="login-form-section">
          <h1 className="form-title">Sign Up</h1>
          <p className="form-subtitle">Enter your details below</p>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <TextField
                label="Full Name"
                type="text"
                variant="outlined"
                fullWidth
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <TextField
                label="Customer Type"
                select
                variant="outlined"
                fullWidth
                id="cusType"
                value={cusType}
                onChange={(e) => setCusType(e.target.value)}
                className="form-input"
              >
                <MenuItem value="Retail">Retail</MenuItem>
                <MenuItem value="Wholesale">Wholesale</MenuItem>
              </TextField>
            </div>
            <div className="form-group">
              <label>Phone Numbers</label>
              {phoneNumbers.map((phoneNumber, index) => (
                <TextField
                  key={index}
                  label={`Phone Number ${index + 1}`}
                  type="text"
                  variant="outlined"
                  fullWidth
                  value={phoneNumber}
                  onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                  className="form-input"
                  style={{ marginBottom: "10px" }}
                />
              ))}
              <Button
                variant="outlined"
                onClick={addPhoneNumberField}
                style={{ marginTop: "10px" }}
              >
                Add Another Phone Number
              </Button>
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="button-container">
              <Button
                disableElevation
                variant="contained"
                className="login-form-button"
                type="submit"
              >
                Sign Up
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />

      {/* Email Verification Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>Email Verification</DialogTitle>
        <DialogContent>
          <p>Please enter the verification code sent to your email:</p>
          <OTPInput
            value={verificationCode}
            onChange={setVerificationCode}
            numInputs={6}
            renderSeparator={<span>-</span>}
            renderInput={(props) => <input {...props} />}
            inputStyle={{
              width: "2rem",
              height: "2rem",
              margin: "0.5rem",
              fontSize: "1.5rem",
              textAlign: "center",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            focusStyle={{
              border: "1px solid #007bff",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleVerifyCode} variant="contained" color="primary">
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SignUp;
