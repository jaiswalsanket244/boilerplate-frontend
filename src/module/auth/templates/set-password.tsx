"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import PasswordFields from "@/components/common/password/password-fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { MFA_AUTH_CONTEXT_VALUES } from "@/lib/constants/paths";
import { setCookies } from "@/lib/utils/cookies";
import AuthLayout from "@/module/auth/components/auth-layout";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import type { IQueryRegisterData } from "@/module/auth/types/index";
import { type PasswordFormData, PasswordSchema } from "@/module/auth/utils/form-utils";
import { useMenuStore } from "@/stores/menu-store";
import { COOKIES } from "@/types";

export default function SetPasswordForm() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { useRegisterMutation } = useAuthAPI();
	const setMenuForUser = useMenuStore((state) => state.setMenuForUser);

	const registerMutation = useRegisterMutation();

	const form = useForm<PasswordFormData>({
		resolver: zodResolver(PasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const userData = queryClient.getQueryData<IQueryRegisterData>(["signupUserData"]);
	const [errorMsg, setErrorMsg] = useState("");

	const onSubmit = (data: PasswordFormData) => {
		if (!userData?.firstName || !userData?.lastName || !userData?.email) {
			router.replace(routes.auth.signUp);
			return;
		}

		const transformedData = {
			name: {
				first: userData.firstName,
				last: userData.lastName,
			},
			email: userData.email,
			password: data.password,
			inviteToken: userData?.inviteToken,
		};

		registerMutation.mutate(transformedData, {
			onSuccess: (data) => {
				if (data.redirectToMfaSetup) {
					setCookies({ [COOKIES.MFA_AUTH_CONTEXT]: MFA_AUTH_CONTEXT_VALUES.SETUP }, 1 / 24);
					router.replace(routes.auth.mfaSetup);
					return;
				}

				const { defaultRedirectUrl } = setMenuForUser(data.user, false);

				router.replace(defaultRedirectUrl);
			},
			onError: (error) => {
				const msg = error.response?.data?.message || "Something went wrong!";
				setErrorMsg(msg);
			},
		});
	};

	return (
		<AuthLayout>
			<form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)} className="space-y-6">
				<h1 className="text-black-400-32-700">Create Password</h1>

				<FormProvider {...form}>
					<PasswordFields />
				</FormProvider>

				{errorMsg && (
					<p className="text-error italic" data-testid="set-password-error">
						{errorMsg}
					</p>
				)}
				<div className="pt-10">
					<Button
						type="submit"
						className="w-full"
						size="xl"
						disabled={!form.formState.isValid || form.formState.isSubmitting || registerMutation.isPending}
						data-testid="set-password-button"
					>
						{form.formState.isSubmitting || registerMutation.isPending ? (
							<Loader2Icon className="h-4 w-4 animate-spin text-white" />
						) : (
							"Finish Sign Up"
						)}
					</Button>
				</div>
			</form>
		</AuthLayout>
	);
}
