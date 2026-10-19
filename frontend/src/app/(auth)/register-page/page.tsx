"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import InputField from "@/app/components/input-field";
import DynamicButton from "../../components/dynamic-buttons";
import Dropdown, { DropdownOption } from "@/app/components/dropdown";
import { ToastContainer, ToastProps } from "@/app/components/dynamic-toast";
import { MailIcon, PhoneIcon, GlobeIcon } from "@/app/components/icons";
import { useRegister } from "@/lib/hooks/useAuth";
import { useProvinces } from "@/lib/queries/provinceQueries";

export default function RegisterPage() {
    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [provinceId, setProvinceId] = useState<number | undefined>();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const { data: provinces } = useProvinces();

    const provinceOptions: DropdownOption[] = useMemo(
        () =>
            (provinces ?? []).map((p: any) => ({
                id: p.province_id,
                label: p.province_name,
                value: p.province_id,
            })),
        [provinces]
    );

    const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
        const id = `${Date.now()}-${Math.random()}`;
        const toastWithId: ToastProps = { ...toast, id };
        setToasts((prev) => [...prev, toastWithId]);
        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const registerMutation = useRegister({
        onSuccess: () => {
            addToast({
                type: "success",
                title: "Registration Submitted",
                description: "Your account is pending superadmin approval.",
                duration: 4000,
            });
            setTimeout(() => router.push("/login-page"), 1500);
        },
        onError: (error: any) => {
            addToast({
                type: "error",
                title: "Registration Failed",
                description: error?.message || "Something went wrong. Please try again.",
                duration: 3000,
            });
        },
    });

    const handleSubmit = async () => {
        if (!firstName || !lastName || !username || !provinceId || !password || !confirmPassword) {
            addToast({
                type: "warning",
                title: "Missing Fields",
                description: "All fields are required.",
                duration: 3000,
            });
            return;
        }

        if (password !== confirmPassword) {
            addToast({
                type: "warning",
                title: "Password Mismatch",
                description: "Passwords do not match.",
                duration: 3000,
            });
            return;
        }

        registerMutation.mutate({
            first_name: firstName,
            last_name: lastName,
            username,
            password,
            province_id: provinceId,
        });
    };

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

            {/* Decorative Hexagon Elements - Z-10 */}
            <div className="absolute w-64 h-64 left--12.5 top-5 opacity-30 pointer-events-none z-10">
                <Image src="/hexagons.png" alt="Decorative hexagon" width={256} height={256} className="w-full h-full object-contain" />
            </div>
            <div className="absolute w-72 h-72 left-50 top-37.5 opacity-25 pointer-events-none z-10">
                <Image src="/hexagons.png" alt="Decorative hexagon" width={288} height={288} className="w-full h-full object-contain" />
            </div>
            <div className="absolute w-56 h-56 left-20 bottom-25 opacity-20 pointer-events-none z-10">
                <Image src="/hexagons.png" alt="Decorative hexagon" width={224} height={224} className="w-full h-full object-contain" />
            </div>

            {/* Left Side Content - Z-20 */}
            <div className="absolute left-0 bottom-0 w-1/2 h-80 pl-12 py-14 flex flex-col justify-end gap-2 z-16">
                {/* DTI and SSF Logos */}
                <div className="flex items-center gap-4 pl-5">
                    <Image
                        src="/DTI.png"
                        alt="DTI Logo"
                        width={100}
                        height={100}
                        className="w-20 h-20 object-contain"
                    />
                    <Image
                        src="/ssf-logo.png"
                        alt="SSF Logo"
                        width={400}
                        height={400}
                        className="w-25 h-25 object-contain"
                    />
                </div>

                {/* Tagline with Gradient - Using IM Fell Great Primer Font */}
                <h3
                    className="text-5xl font-normal italic max-w-xl text-balance"
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

                {/* Contact Row */}
                <div className="flex gap-8 text-sm pl-5 pt-10" style={{ color: "#6B7280" }}>
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

            {/* Main Register Container */}
            <div className="fixed right-0 top-1/2 transform -translate-y-1/2 w-180 h-238 bg-white rounded-tl-[80px] rounded-bl-[80px] shadow-[0px_4px_16px_rgba(0,0,0,0.20)] overflow-hidden flex flex-col items-center justify-start pt-24 z-18 overflow-y-auto">
                <div className="w-118.25 flex flex-col gap-8 pb-10">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="flex items-center justify-center gap-4">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <Image width={80} height={80} src="/DTI.png" alt="DTI Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="relative w-52 h-20 flex items-center justify-center">
                                <Image width={208} height={80} src="/ssf-logo.png" alt="SSF Logo" className="w-full h-full object-contain" />
                            </div>
                        </div>

                        <h1
                            className="text-4xl font-bold leading-tight"
                            style={{ color: "#182286", fontFamily: "Inter, sans-serif" }}
                        >
                            Create an account
                        </h1>

                        <p className="text-sm font-normal" style={{ color: "#6B7280", fontFamily: "Inter, sans-serif" }}>
                            Fill in your details to request access.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <InputField
                            label="First Name"
                            name="first_name"
                            placeholder="Enter First Name"
                            type="text"
                            value={firstName}
                            onChange={setFirstName}
                            required
                        />

                        <InputField
                            label="Last Name"
                            name="last_name"
                            placeholder="Enter Last Name"
                            type="text"
                            value={lastName}
                            onChange={setLastName}
                            required
                        />

                        <InputField
                            label="Username"
                            name="username"
                            placeholder="Enter Username"
                            type="text"
                            value={username}
                            onChange={setUsername}
                            required
                        />

                        <Dropdown
                            variant="secondary"
                            label="Designation"
                            options={provinceOptions}
                            selectedValue={provinceId}
                            onSelect={(option) => setProvinceId(Number(option.value))}
                            placeholder="Select your province"
                        />

                        <InputField
                            label="Password"
                            name="password"
                            placeholder="Enter Password"
                            type="password"
                            value={password}
                            onChange={setPassword}
                            required
                        />

                        <InputField
                            label="Confirm Password"
                            name="confirm_password"
                            placeholder="Re-enter Password"
                            type="password"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            required
                        />

                        <DynamicButton
                            label={registerMutation.isPending ? "Submitting..." : "Register"}
                            onClick={handleSubmit}
                            disabled={registerMutation.isPending}
                            variant="blue"
                            fullWidth
                            size="medium"
                        />

                        <p className="text-sm text-center" style={{ color: "#6B7280", fontFamily: "Inter, sans-serif" }}>
                            Already have an account?{" "}
                            <Link href="/login-page" className="font-semibold hover:underline" style={{ color: "#182286" }}>
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <ToastContainer toasts={toasts} position="top-right" onRemoveToast={removeToast} />
        </main>
    );
}