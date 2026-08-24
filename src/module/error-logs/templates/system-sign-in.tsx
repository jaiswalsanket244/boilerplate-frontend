"use client";

import { routes } from "@/config/routes";
import { PiArrowRightBold } from "react-icons/pi";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { UserLoginDataType } from "@/module/error-logs/types";
import { useErrorLogsAPI } from "@/module/error-logs/hooks/useErrorLogs";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setCookies, clearCookies } from "@/lib/utils/cookies";
import { COOKIES } from "@/types";

export default function SystemSignIn() {
	const [userData, setUserData] = useState<UserLoginDataType>({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handlePasswordVisibility = () => setShowPassword(!showPassword);
	const router = useRouter();
	const { usePostLoginMutation } = useErrorLogsAPI();
	const isButtonDisabled = !Object.values(userData).every(Boolean);

	const { mutate, isPending } = usePostLoginMutation;

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrorMessage(null); // reset error state

		mutate(userData, {
			onSuccess: (data) => {
				const {
					user: { roles, _id },
				} = data;
				clearCookies();

				setCookies({
					[COOKIES.USER_TYPE]: roles,
					[COOKIES.USER_REF]: _id,
				});

				router.push(routes.system.errorLogs.generic);
			},
			onError: () => {
				setErrorMessage("Invalid email or password. Please try again.");
			},
		});
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setUserData((prevData) => ({
			...prevData,
			[name]: value,
		}));
		if (errorMessage) setErrorMessage(null);
	};

	return (
		<main>
			<div className="m-auto flex min-h-screen w-[30%] flex-col items-center justify-center">
				<h1 className="mb-5 text-xl font-semibold">System</h1>

				<form onSubmit={handleSubmit} className="w-full space-y-5">
					{/* Email Field */}
					<div>
						<Label htmlFor="email">Email</Label>
						<Input
							type="email"
							name="email"
							placeholder="Enter your email"
							value={userData.email}
							onChange={handleInputChange}
							className={cn(errorMessage && "border-destructive focus-visible:ring-destructive")}
						/>
					</div>

					{/* Password Field */}
					<div>
						<Label htmlFor="password">Password</Label>
						<div className="relative">
							<Input
								type={showPassword ? "text" : "password"}
								id="password"
								name="password"
								placeholder="Enter your password"
								value={userData.password}
								onChange={handleInputChange}
								className={cn(errorMessage && "border-destructive focus-visible:ring-destructive")}
							/>
							<Button
								type="button"
								className="absolute end-1 top-1/2 -translate-y-1/2"
								aria-label={showPassword ? "Hide password" : "Show password"}
								onClick={handlePasswordVisibility}
								variant="ghost"
							>
								{showPassword ? <IoMdEyeOff /> : <IoMdEye />}
							</Button>
						</div>
					</div>

					{/* Inline error message */}
					{errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}

					<Button className="w-full" type="submit" size="lg" disabled={isButtonDisabled || isPending}>
						<span>{isPending ? "Signing in..." : "Sign in"}</span>
						<PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
					</Button>
				</form>
			</div>
		</main>
	);
}
