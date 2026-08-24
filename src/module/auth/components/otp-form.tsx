"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { CheckCircle, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

import GoBackButton from "@/components/common/go-back-button";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import type { IOtpFormProps, OtpFormData } from "@/module/auth/types/index";
import { otpSchema } from "@/module/auth/utils/form-utils";

export default function OtpForm({
	email,
	title,
	description,
	submitButtonText,
	onSubmit,
	otpLength,
	isLoading = false,
	isIncorrectOtp = false,
	setIsIncorrectOtp,
	isCorrectOtp = false,
}: IOtpFormProps) {
	const form = useForm<OtpFormData>({
		resolver: zodResolver(otpSchema),
		defaultValues: { otp: "" },
	});

	const router = useRouter();

	const handleOtpChange = (value: string, onChange: (value: string) => void) => {
		onChange(value);
		if (form.formState.errors.otp) {
			form.clearErrors("otp");
			setIsIncorrectOtp?.(false);
		}
	};

	useEffect(() => {
		if (isIncorrectOtp) {
			form.setError("otp", { message: "Incorrect OTP. Please try again" });
		}
	}, [isIncorrectOtp, form]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		/*
		 Enter submits without going through the button, so the in-flight check has to be
		 repeated here — otherwise holding Enter sends the same code over and over.
		*/
		if (e.key === "Enter" && !isLoading && form.watch("otp")?.length === otpLength) {
			e.preventDefault();
			void form.handleSubmit(onSubmit)();
		}
	};

	const handleGoBack = () => router.back();

	return (
		<form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
			<GoBackButton onClick={handleGoBack} />

			<h1 className="mt-4 mb-10 text-black-400-32-700">{title}</h1>
			<p className="mb-4 text-grey-100-14-500">
				{description}
				<span className="font-medium text-foreground"> {email}.</span>
			</p>

			<div className="space-y-10">
				<Field data-invalid={!!form.formState.errors.otp} className="flex flex-col gap-2">
					<FieldLabel className="mb-[10px] font-medium text-txt-primary">Enter OTP</FieldLabel>

					<InputOTP
						pattern={REGEXP_ONLY_DIGITS}
						maxLength={otpLength}
						value={form.watch("otp") || ""}
						onChange={(value) => handleOtpChange(value, (val) => form.setValue("otp", val))}
						onKeyDown={handleKeyDown}
						data-testid="input-otp"
						id="otp-field"
					>
						<InputOTPGroup className="flex gap-2">
							{Array.from({ length: otpLength }).map((_, index) => (
								<React.Fragment key={`otp-slot-${index}`}>
									<InputOTPSlot
										index={index}
										className={cn(
											"size-[42px] rounded-sm border border-border/50 bg-muted/70 text-base shadow-none lg:size-[56px]",
											isIncorrectOtp
												? "border-error ring-1 ring-error data-[state=active]:ring-error"
												: isCorrectOtp
													? "border-success ring-1 ring-success data-[state=active]:ring-success"
													: ""
										)}
									/>
									{index !== otpLength - 1 && <InputOTPSeparator />}
								</React.Fragment>
							))}
						</InputOTPGroup>
					</InputOTP>

					{form.formState.errors.otp && <FieldError>{form.formState.errors.otp.message}</FieldError>}

					{isCorrectOtp && (
						<div className="flex items-center gap-2">
							<CheckCircle className="size-4 text-success" />
							<p className="text-success">OTP verified!</p>
						</div>
					)}
				</Field>

				<Button
					className="w-full"
					type="submit"
					size="xl"
					color="info"
					disabled={isLoading || !form.watch("otp") || form.watch("otp").length !== otpLength}
				>
					{isLoading ? <Loader2Icon className="h-4 w-4 animate-spin text-white" /> : submitButtonText}
				</Button>
			</div>
		</form>
	);
}
