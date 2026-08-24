"use client";

import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import {
	profileFormSchema,
	type ProfileFormTypes,
	type UpdateApiResponseType,
	type UpdatedProfileDataType,
} from "@/module/profile/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { type AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export const useProfileForm = () => {
	const { useGetUserData } = useProfileAPI();
	const { data: user, isLoading, error } = useGetUserData();

	const form = useForm<ProfileFormTypes>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
		},
	});

	// initialize user data
	useEffect(() => {
		if (!user || isLoading) return;

		form.reset({
			firstName: user.name.first ?? "",
			lastName: user.name.last ?? "",
			email: user.email ?? "",
		});
	}, [user, isLoading]);

	return { form, user, isLoading, error };
};

export const useImageUpload = () => {
	const { useGetSignedUrl, useGetUserData } = useProfileAPI();

	const { data: user } = useGetUserData();

	const [file, setFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	useEffect(() => {
		setPreviewUrl(user?.images?.at(0) || null);
	}, [user]);

	const selectFile = (file: File, preview: string) => {
		if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);

		setFile(file);
		setPreviewUrl(preview);
	};

	const removeFile = () => {
		if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
		setFile(null);
		setPreviewUrl(null);
	};

	const uploadToS3 = async () => {
		if (!file) return null;

		const presign = await useGetSignedUrl.mutateAsync({
			fileName: file.name,
			fileType: file.type,
		});

		const { url, keyFile } = presign.data;

		await fetch(url, {
			method: "PUT",
			headers: { "Content-Type": file.type },
			body: file,
		});

		setFile(null);
		return `https://boilerplate-s3-bucket.s3.us-east-2.amazonaws.com/${keyFile}`;
	};

	return {
		file,
		previewUrl,
		selectFile,
		removeFile,
		uploadToS3,
	};
};

export const useProfileSubmit = ({ uploadToS3 }: { uploadToS3: () => Promise<string | null> }) => {
	const { useUpdateProfile, useGetUserData } = useProfileAPI();

	const { data: user, isPending } = useGetUserData();

	const [status, setStatus] = useState({
		isSuccess: false,
		error: "",
	});

	const submit = async (form: ProfileFormTypes) => {
		try {
			const uploadedImage = await uploadToS3();

			const payload: UpdatedProfileDataType = {
				name: { first: form.firstName, last: form.lastName },
			};

			if (!user || !user.companyRef) return;

			if (uploadedImage) payload.images = uploadedImage;

			await useUpdateProfile.mutateAsync(payload);

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
