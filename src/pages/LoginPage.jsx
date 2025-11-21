import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const mailIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v.01L12 13l8-6.99V6H4zm0 3.236V18h16V9.236l-7.382 5.75a1.5 1.5 0 0 1-1.836 0L4 9.236z"
        fill="currentColor"
      />
    </svg>
  );

  const lockIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v3h6V7a3 3 0 0 0-3-3z"
        fill="currentColor"
      />
    </svg>
  );

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


