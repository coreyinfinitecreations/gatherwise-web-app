"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { StateSelect } from "@/components/ui/state-select";

export default function TestRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [success, setSuccess] = useState<{
    adminId: string;
    organizationId: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const firstName = formData.get("firstName")?.toString().trim();
    const lastName = formData.get("lastName")?.toString().trim();
    const organizationName = formData.get("organization")?.toString().trim();
    const address = formData.get("address")?.toString().trim();
    const city = formData.get("city")?.toString().trim();
    const zipCode = formData.get("zipCode")?.toString().trim();

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !organizationName ||
      !address ||
      !city ||
      !selectedState ||
      !zipCode
    ) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/test/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name: `${firstName} ${lastName}`,
          organizationName,
          address,
          city,
          state: selectedState,
          zipCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      setSuccess({
        adminId: data.user.id,
        organizationId: data.user.organizationId || "N/A",
      });

      // Use the auth context login function to properly set auth state
      // This will store user in localStorage and set cookies
      const loginSuccess = await login(email, password);

      if (loginSuccess) {
        // Redirect to onboarding after short delay
        setTimeout(() => {
          router.push("/onboarding");
        }, 1500);
      } else {
        setError("User created but auto-login failed. Please log in manually.");
        setSuccess(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg py-12 px-6">
      <h1 className="text-2xl font-semibold mb-4">
        Register Test Admin & Organization
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        Creates a new Administrator account, associated Organization (Church),
        and assigns the email as primary login. This is a temporary internal
        utility.
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-700">
          <p className="font-medium mb-1">Success!</p>
          <p>
            Admin ID:{" "}
            <code className="bg-green-100 px-1 rounded">{success.adminId}</code>
          </p>
          <p>
            Organization ID:{" "}
            <code className="bg-green-100 px-1 rounded">
              {success.organizationId}
            </code>
          </p>
          <p className="mt-2 text-xs animate-pulse">
            Redirecting to your dashboard...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium mb-1"
            >
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              disabled={isLoading || !!success}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="John"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium mb-1"
            >
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              disabled={isLoading || !!success}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Doe"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Admin Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={isLoading || !!success}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="admin@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            disabled={isLoading || !!success}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Min 8 characters"
          />
        </div>
        <div>
          <label
            htmlFor="organization"
            className="block text-sm font-medium mb-1"
          >
            Organization / Church Name
          </label>
          <input
            id="organization"
            name="organization"
            type="text"
            required
            disabled={isLoading || !!success}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Grace Fellowship"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            Street Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            required
            disabled={isLoading || !!success}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="123 Main Street"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              disabled={isLoading || !!success}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Springfield"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium mb-1">
              State
            </label>
            <StateSelect
              value={selectedState}
              onChange={setSelectedState}
              disabled={isLoading || !!success}
            />
          </div>
        </div>
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
            ZIP Code
          </label>
          <input
            id="zipCode"
            name="zipCode"
            type="text"
            required
            maxLength={5}
            pattern="[0-9]{5}"
            disabled={isLoading || !!success}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="12345"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !!success}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white text-sm font-medium shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isLoading && (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {isLoading ? "Creating..." : "Create Admin & Organization"}
        </button>
      </form>

      <div className="mt-8 text-xs text-gray-500 leading-relaxed">
        <p>This creates a user directly in the in-memory UserManager store.</p>
        <p className="mt-1">
          After creation, you'll be automatically logged in and redirected to
          the dashboard.
        </p>
      </div>
    </div>
  );
}
