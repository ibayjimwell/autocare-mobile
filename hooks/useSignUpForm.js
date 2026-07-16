import { useState } from "react";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { signupSchema } from "../utils/validation";

export function useSignUpForm() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [signupError, setSignupError] = useState("");   // new

  const handleFieldChange = (field, value) => {
    switch (field) {
      case "fullName": setFullName(value); break;
      case "email": setEmail(value); break;
      case "phone": setPhone(value); break;
      case "password": setPassword(value); break;
      case "confirmPassword": setConfirmPassword(value); break;
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    if (signupError) setSignupError("");
  };

  const handleSignup = async () => {
    setSignupError("");
    try {
      signupSchema.parse({ fullName, email, phone, password, confirmPassword });
      setErrors({});
    } catch (err) {
      const formattedErrors = {};
      err.issues.forEach((issue) => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    if (!agree) {
      setSignupError("You must agree to the Terms of Service.");
      return;
    }

    setLoading(true);
    const result = await register(fullName, email, phone, password);
    setLoading(false);
    if (result.success) {
      router.replace("/(tabs)");
    } else {
      setSignupError(result.message || "Signup failed");
    }
  };

  return {
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    agree,
    setAgree,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    loading,
    errors,
    signupError,
    handleFieldChange,
    handleSignup,
  };
}