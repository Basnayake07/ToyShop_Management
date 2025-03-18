function validateLogin(values) {
  let errors = {};
  const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const password_pattern =  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;

  if (!values.email) {
    errors.email = "Email address is required";
  }
  else if (!email_pattern.test(values.email)) {
    errors.email = "Email address is invalid";
  }

  if (!values.password) {
    errors.password = "Password is required";
  }
  else if (!password_pattern.test(values.password)) {
    errors.password = "Password is invalid";
    }
   
    
  return errors;
}

export default validateLogin;