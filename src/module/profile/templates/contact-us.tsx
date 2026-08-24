"use client";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { routes } from "@/config/routes";
import { setSessionStorage } from "@/lib/utils/session-storage";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";
import useUserQueryAPI from "@/module/profile/hooks/useUserQueryAPI";
import { type ContactFormData, contactFormSchema, USER_QUERY_SUBJECT } from "@/module/profile/types";
import { contactFormFieldConfigs, MESSAGE_CHAR_LIMIT } from "@/module/profile/utils/contact-us-form-config";
import { SESSION_STORAGE_KEYS } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const ContactUs = () => {
	const router = useRouter();

	const { useGetUserData } = useProfileAPI();
	const { useCreateUserQuery } = useUserQueryAPI();

	const { data: user } = useGetUserData();
	const { mutateAsync: createUserQuery } = useCreateUserQuery();

	const [error, setError] = useState<string | null>(null);

	const form = useForm<ContactFormData>({
		resolver: zodResolver(contactFormSchema),
		defaultValues: {
			email: user?.email || "",
			subject: USER_QUERY_SUBJECT.GENERAL,
			message: "",
			name: {
				first: user?.name.first || "",
				last: user?.name.last || "",
			},
		},
	});

	const watchedMessage = form.watch("message");

	const onSubmit = async (data: ContactFormData) => {
		try {
			const response = await createUserQuery(data);

			setSessionStorage(SESSION_STORAGE_KEYS.NEW_QUERY_IDS, [response._id]);

			router.push(routes.settings.previousQueries);
			form.reset();
			setError(null);
		} catch (error) {
			setError("Failed to submit query. Please try again.");
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
		const pastedText = e.clipboardData.getData("text");
		const currentMessage = watchedMessage || "";
		const availableSpace = MESSAGE_CHAR_LIMIT - currentMessage.length;

		if (pastedText.length > availableSpace) {
			e.preventDefault();
			// Only paste what fits within the limit
			const trimmedText = pastedText.substring(0, availableSpace);
			form.setValue("message", currentMessage + trimmedText);
		}
	};

	useEffect(() => {
		if (user) {
			form.setValue("email", user.email);
			form.setValue("name.first", user.name.first);
			form.setValue("name.last", user.name.last);
		}
	}, [user, form]);

	return (
		<div className="h-full max-w-3xl space-y-4 overflow-y-auto">
			<div className="flex items-center justify-between">
				<h2 className="text-20-700">Contact Us</h2>
				<Link href={routes.settings.previousQueries} className="font-semibold underline underline-offset-4">
					View Previous Queries
				</Link>
			</div>
			<div className="bg-gray-tertiary/10 border-border/50 bg-muted/10 space-y-2 rounded-2xl border p-6">
				<form className="space-y-10" onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}>
					<FieldGroup>
						<div className="grid grid-cols-1 gap-[30px] lg:grid-cols-2">
							<FormInputWrapper form={form} fieldConfig={contactFormFieldConfigs.firstName} />

							<FormInputWrapper form={form} fieldConfig={contactFormFieldConfigs.lastName} />
						</div>

						<FormInputWrapper form={form} fieldConfig={contactFormFieldConfigs.email} />

						<FormInputWrapper form={form} fieldConfig={contactFormFieldConfigs.subject} />

						<FormInputWrapper form={form} fieldConfig={contactFormFieldConfigs.message(handlePaste)} />
					</FieldGroup>

					<div className="flex flex-col items-center justify-center gap-4">
						{error && <p className="text-error text-center text-sm">{error}</p>}
						<Button className="h-10 min-w-52 text-base" type="submit" disabled={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? "Sending..." : "Send Query"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ContactUs;
