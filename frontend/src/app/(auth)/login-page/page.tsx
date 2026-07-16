"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import InputField from "@/app/components/input-field";
import DynamicButton from "../../components/dynamic-buttons";
import { ToastContainer, ToastProps } from "@/app/components/dynamic-toast";
import { MailIcon, PhoneIcon, GlobeIcon } from "@/app/components/icons";
import { useLogin } from "@/lib/hooks/useAuth";
import Link from "next/link";


export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    const toastWithId: ToastProps = { ...toast, id };
    setToasts((prev) => [...prev, toastWithId]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);


  const loginMutation = useLogin({
    onSuccess: (data) => {
      addToast({
        type: "success",
        title: "Login Successful",
        description: "You will be redirected",
        duration: 3000,
      });
      router.push("/");

    },
    onError: (error: any) => {
      addToast({
        type: "error",
        title: "Login Failed",
        description: error?.message || "Invalid username or password.",
        duration: 3000,
      });
    },

  });
  const handleSubmit = async () => {
    if (!username || !password) {
      addToast({
        type: "warning",
        title: "Missing Fields",
        description: "Username and password are required.",
        duration: 3000,
      });
      return;
    }

    loginMutation.mutate({ username, password })
  }

  return (
    <main className="w-screen h-screen fixed inset-0 bg-linear-to-r from-slate-100 to-blue-100 overflow-hidden flex items-center justify-end">
      {/* Full-Page Background Layer - Z-0 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
        <Image
          fill
          sizes="100vw"
          className="w-full h-full object-cover"
          src="/background.png"
          alt="Background decoration"
        />
      </div>

      {/* Decorative Hexagon Elements - Z-10 (visible on left) */}
      <div className="absolute w-64 h-64 left--12.5 top-5 opacity-30 pointer-events-none z-10">
        <Image
          src="/hexagons.png"
          alt="Decorative hexagon"
          width={256}
          height={256}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="absolute w-72 h-72 left-50 top-37.5 opacity-25 pointer-events-none z-10">
        <Image
          src="/hexagons.png"
          alt="Decorative hexagon"
          width={288}
          height={288}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="absolute w-56 h-56 left-20 bottom-25 opacity-20 pointer-events-none z-10">
        <Image
          src="/hexagons.png"
          alt="Decorative hexagon"
          width={224}
          height={224}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Left Side Content - Z-20 */}
      <div className="absolute left-0 bottom-0 w-1/2 h-80 pl-12 py-14 flex flex-col justify-end gap-2 z-16">
        {/* SSF Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-25 h-25 shrink-0 pl-5">
            <Image
              src="/ssf-logo.png"
              alt="SSF Logo"
              width={400}
              height={400}
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-3xl font-semibold" style={{ color: "#182286" }}>
            Shared Service Facilities
          </h2>
        </div>

        {/* Tagline with Gradient - Using IM Fell Great Primer Font */}
        <h3
          className="text-6xl font-normal italic"
          style={{
            fontFamily: "var(--font-im-fell-great-primer), serif",
            backgroundImage: "linear-gradient(90deg, #182286 0%, #0052B3 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          &ldquo;Shared Success for Filipino MSMEs&rdquo;
        </h3>

        <div
          className="flex gap-8 text-sm pl-5 pt-10"
          style={{ color: "#6B7280" }}
        >
          <div className="flex items-center gap-2">
            <MailIcon size={18} />
            <span>r11@dti.gov.ph</span>
          </div>

          <div className="flex items-center gap-2">
            <PhoneIcon size={18} />
            <span>(082) 224 0511</span>
          </div>

          <div className="flex items-center gap-2">
            <GlobeIcon size={18} />
            <span>https://www.facebook.com/DTI.RegionXI/</span>
          </div>
        </div>
      </div>

      {/* Main Login Container - Positioned on Right - Z-30 */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 w-180 h-238 bg-white rounded-tl-[80px] rounded-bl-[80px] shadow-[0px_4px_16px_rgba(0,0,0,0.20)] overflow-hidden flex flex-col items-center justify-start pt-50 z-18">
        <div className="w-118.25 flex flex-col gap-12">
          {/* Header Section */}
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Logo - SSF Logo */}
            <div className="relative w-52 h-20 flex items-center justify-center">
              <Image
                width={208}
                height={80}
                src="/ssf-logo.png"
                alt="SSF Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Title */}
            <h1
              className="text-4xl font-bold leading-tight"
              style={{
                color: "#182286",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Sign in to your account
            </h1>

            {/* Subtitle */}
            <p
              className="text-sm font-normal"
              style={{
                color: "#6B7280",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Welcome back! Please enter your account details.
            </p>
          </div>

          {/* Form Section */}
          <div className="flex flex-col gap-10">
            {/* Username Input Field */}
            <InputField
              label="Username"
              name="username"
              placeholder="Enter Name"
              type="text"
              value={username}
              onChange={setUsername}
              required
            />

            {/* Password Input Field with Visibility Toggle */}
            <InputField
              label="Password"
              name="password"
              placeholder="Enter Password"
              type="password"
              value={password}
              onChange={setPassword}
              required
            />

            {/* Login Button */}
            <DynamicButton
              label={loginMutation.isPending ? "Signing In..." : "Sign In"}
              onClick={handleSubmit}
              disabled={loginMutation.isPending}
              variant="blue"
              fullWidth
              size="medium"
            />

            {/* Register Link */}
            <p
              className="text-sm text-center"
              style={{ color: "#6B7280", fontFamily: "Inter, sans-serif" }}
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/register-page"
                className="font-semibold hover:underline"
                style={{ color: "#182286" }}
              >
                Register here
              </Link>
            </p>

          </div>
        </div>

        {/* DTI Logo Footer */}
        <div className="absolute bottom-6 right-6 w-20 h-20 flex items-center justify-center z-20">
          <Image
            width={80}
            height={80}
            src="/DTI.png"
            alt="DTI Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Toast Container - Displays all notifications */}
      <ToastContainer
        toasts={toasts}
        position="top-right"
        onRemoveToast={removeToast}
      />
    </main>
  );
}
