import { useState } from "react";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { loginSchema } from "../utils/validation";

export function useLoginForm() {
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState("");

  const handleFieldChange = (field: string, value: string) => {
    if (field === "emailOrPhone") setEmailOrPhone(value);
    else if (field === "password") setPassword(value);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    if (loginError) setLoginError("");
  };

  const handleLogin = async () => {
    setLoginError("");
    try {
      loginSchema.parse({ emailOrPhone, password });
      setErrors({});
    } catch (err: any) {
      const formattedErrors: Record<string, string> = {};
      err.issues.forEach((issue: any) => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setLoading(true);
    const result = await login(emailOrPhone, password);
    setLoading(false);
    if (result.success) {
      router.replace("/(tabs)");
    } else {
      setLoginError(result.message || "Login failed. Please try again.");
    }
  };

  return {
    emailOrPhone,
    password,
    showPassword,
    setShowPassword,
    loading,
    errors,
    loginError,
    handleFieldChange,
    handleLogin,
  };
}