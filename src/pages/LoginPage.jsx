import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail } from "lucide-react";
import "../index.css";

import AuthCardLayout from "../components/layout/AuthCardLayout.jsx";
import FormField from "../components/form/FormField.jsx";
import TextInput from "../components/form/TextInput.jsx";
import PasswordInput from "../components/form/PasswordInput.jsx";
import PrimaryButton from "../components/buttons/PrimaryButton.jsx";

function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    navigate("/dashboard");
  }

  const mailIcon = <Mail size={18} aria-hidden="true" />;

  const lockIcon = <LockKeyhole size={18} aria-hidden="true" />;

  const canSubmit = form.email.trim() !== "" && form.password.trim() !== "";

  return (
    <AuthCardLayout
      title="Welcome back to AEGIS"
      subtitle="Log in to access your dashboard"
    >
      <form className="aegis-auth-form" onSubmit={handleSubmit}>
        <FormField label="Email address">
          <TextInput
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@company.com"
            icon={mailIcon}
            required
          />
        </FormField>

        <FormField label="Password">
          <PasswordInput
            name="password"
            value={form.password}
            onChange={handleChange}
            icon={lockIcon}
            required
          />
          <div className="aegis-forgot-row">
            <button
              type="button"
              className="aegis-link aegis-forgot-link"
              onClick={() => console.log("Forgot password clicked")}
            >
              Forgot your password?
            </button>
          </div>
        </FormField>

        <PrimaryButton type="submit" disabled={!canSubmit}>
          Sign In
        </PrimaryButton>

        <div className="aegis-login-footer">
          <span>Don&apos;t have an account? </span>
          <button
            type="button"
            className="aegis-link"
            onClick={() => console.log("Go to signup")}
          >
            Create one
          </button>
        </div>
      </form>
    </AuthCardLayout>
  );
}

export default LoginPage;


