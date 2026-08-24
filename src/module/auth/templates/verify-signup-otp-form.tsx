"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { routes } from "@/config/routes";
import AuthLayout from "@/module/auth/components/auth-layout";
import OtpForm from "@/module/auth/components/otp-form";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { AUTH_PAGE_TYPE, type IUserRegisterData, OTP_PURPOSE, type OtpFormData } from "@/module/auth/types";

export default function VerifySignupOtpForm() {
	const queryClient = useQueryClient();
	const router = useRouter();

	const userData = queryClient.getQueryData<IUserRegisterData>(["signupUserData"]);
	const { useVerifyOtpMutation } = useAuthAPI();
	const { mutate: verifyEmailOtp, isPending } = useVerifyOtpMutation();

	const [otpVerificationStatus, setOtpVerificationStatus] = useState({
		correct: false,
		incorrect: false,
	});

	const handleSubmit = (data: OtpFormData) => {
		const verificationData = {
			identifier: userData?.email || "",
			purpose: OTP_PURPOSE.SIGNUP,
			otp: data.otp,
		};

		verifyEmailOtp(verificationData, {
			onSuccess: () => {
				setOtpVerificationStatus({
					correct: true,
					incorrect: false,
				});
				router.push(routes.auth.setPassword);
			},
			onError: () => {
				setOtpVerificationStatus({
					correct: false,
					incorrect: true,
				});
			},
		});
	};

	if (!userData?.email) {
		return (
			<div className="text-center">
				<p className="text-red-500">User data not found. Please start the signup process again.</p>
			</div>
		);
	}
	const setIsIncorrectOtp = (value: boolean) => {
		setOtpVerificationStatus({
			correct: false,
			incorrect: value,
		});
	};

	return (
		<AuthLayout type={AUTH_PAGE_TYPE.VERIFY_OTP}>
			<OtpForm
				email={userData.email}
				title="Verify Email"
				submitButtonText="Verify Email"
				description="We've sent you an email with an OTP on"
				onSubmit={handleSubmit}
				isLoading={isPending}
				otpLength={4}
				isIncorrectOtp={otpVerificationStatus.incorrect}
				isCorrectOtp={otpVerificationStatus.correct}
				setIsIncorrectOtp={setIsIncorrectOtp}
			/>
		</AuthLayout>
	);
}
