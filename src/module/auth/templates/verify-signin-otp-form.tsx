"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import AuthLayout from "@/module/auth/components/auth-layout";
import OtpForm from "@/module/auth/components/otp-form";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import {
	AUTH_PAGE_TYPE,
	type IUserRegisterData,
	type IVerifyEmailOtpData,
	type OtpFormData,
} from "@/module/auth/types/index";
import { useMenuStore } from "@/stores/menu-store";

export default function VerifySignInOtpForm() {
	const queryClient = useQueryClient();
	const router = useRouter();

	const setMenuForUser = useMenuStore((state) => state.setMenuForUser);

	const userData = queryClient.getQueryData<IUserRegisterData>(["signInUserData"]);

	const { useLoginMutation } = useAuthAPI();

	const loginMutation = useLoginMutation();

	const [otpVerificationStatus, setOtpVerificationStatus] = useState({
		correct: false,
		incorrect: false,
	});

	const setIsIncorrectOtp = (value: boolean) => {
		setOtpVerificationStatus({
			correct: false,
			incorrect: value,
		});
	};

	const handleSubmit = (data: OtpFormData) => {
		if (data.otp.length !== 4) {
			setIsIncorrectOtp(true);
			return;
		}

		const loginData: IVerifyEmailOtpData = {
			email: userData?.email,
			otp: data.otp,
			loginType: "otp",
		};

		loginMutation.mutate(loginData, {
			onSuccess: (data) => {
				setOtpVerificationStatus({
					correct: true,
					incorrect: false,
				});
				const { defaultRedirectUrl } = setMenuForUser(data?.user);

				router.replace(defaultRedirectUrl);
			},
			onError: () => {
				setIsIncorrectOtp(true);
			},
		});
	};

	if (!userData?.email) {
		return (
			<div className="text-center">
				<p className="text-red-500">User data not found. Please start the sign in process again.</p>
			</div>
		);
	}

	return (
		<AuthLayout type={AUTH_PAGE_TYPE.VERIFY_OTP}>
			<OtpForm
				email={userData.email}
				title="Sign In"
				submitButtonText="Sign In"
				description="We've sent you an OTP on"
				onSubmit={handleSubmit}
				isLoading={loginMutation.isPending}
				otpLength={4}
				isIncorrectOtp={otpVerificationStatus.incorrect}
				isCorrectOtp={otpVerificationStatus.correct}
				setIsIncorrectOtp={setIsIncorrectOtp}
			/>
		</AuthLayout>
	);
}
