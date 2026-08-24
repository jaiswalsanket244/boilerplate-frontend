"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySettingsFormSchema, type TCompanySettingsForm } from "@/module/profile/types";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import type { AxiosError } from "axios";
import type { UpdateApiResponseType } from "@/module/profile/types";

export const useCompanySettingsForm = () => {
	const { useGetUserData } = useProfileAPI();
	const { data: user, isLoading, error } = useGetUserData();

	const form = useForm<TCompanySettingsForm>({
		resolver: zodResolver(companySettingsFormSchema),
		defaultValues: {
			supportEmail: "",
			enablePasswordRotation: false,
			passwordValidityDays: 90,
			gracePeriodDays: 5,
		},
	});

	useEffect(() => {
		if (!user || isLoading) return;

		form.reset({
			supportEmail: user.companyRef?.supportEmail ?? "",
			enablePasswordRotation: user.companyRef?.rotatePassword ?? false,
			passwordValidityDays: user.companyRef?.passwordValidityDays ?? 90,
			gracePeriodDays: user.companyRef?.passwordGraceDays ?? 5,
		});
	}, [user, isLoading, form]);

	return { form, user, isLoading, error };
};

export const useCompanySettingsSubmit = () => {
	const { useUpdateCompany, useGetUserData } = useProfileAPI();
	const { data: user, isPending } = useGetUserData();

	const [status, setStatus] = useState({
		isSuccess: false,
		error: "",
	});

	const submit = async (form: TCompanySettingsForm) => {
		try {
			if (!user || !user.companyRef) return;

			await useUpdateCompany.mutateAsync({
				id: user.companyRef._id,
				data: {
					supportEmail: form.supportEmail,
					rotatePassword: form.enablePasswordRotation,
					passwordValidityDays: form.passwordValidityDays,
					passwordGraceDays: form.gracePeriodDays,
				},
			});

			setStatus({ isSuccess: true, error: "" });

			setTimeout(() => setStatus({ isSuccess: false, error: "" }), 3000);
		} catch (err) {
			const axiosErr = err as AxiosError<UpdateApiResponseType>;
			setStatus({
				isSuccess: false,
				error: axiosErr.response?.data?.message ?? (err instanceof Error ? err.message : "Something went wrong"),
			});
		}
	};

	return { submit, status, isPending };
};
