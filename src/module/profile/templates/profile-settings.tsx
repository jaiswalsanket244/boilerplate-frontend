"use client";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { ImageUploadButton } from "@/module/profile/components/image-upload";
import { CheckCircle, Loader2Icon } from "lucide-react";

import { getErrorMessage } from "@/lib/utils";
import MfaReconfigureTrigger from "@/module/profile/components/mfa-toggle-switch";
import { useImageUpload, useProfileForm, useProfileSubmit } from "@/module/profile/hooks/useProfileForm";
import { profileFormConfig } from "@/module/profile/utils/profile-settings-config";

export default function ProfileSettings() {
	const { form, isLoading, error } = useProfileForm();
	const image = useImageUpload();
	const { submit, status } = useProfileSubmit({ uploadToS3: image.uploadToS3 });

	const initials = `${form.watch("firstName")?.[0] ?? ""}${form.watch("lastName")?.[0] ?? ""}`;

	if (isLoading) {
		return (
			<div className="flex h-[80vh] items-center justify-center p-6 py-20">
				<Loader2Icon className="mr-2 h-10 w-10 animate-spin" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-[80vh] items-center justify-center p-6 py-20">
				<p className="text-error">{getErrorMessage(error)}</p>
			</div>
		);
	}

	return (
		<div className="max-w-2xl p-6">
			<Card className="border-none shadow-none">
				<CardHeader>
					<CardTitle className="text-2xl font-semibold">Profile Settings</CardTitle>
				</CardHeader>

				<CardContent className="space-y-6">
					<div className="space-y-2">
						<ImageUploadButton
							currentImageUrl={image.previewUrl || ""}
							fallbackText={initials}
							onImageSelect={image.selectFile}
							onImageRemove={image.removeFile}
							isUploading={form.formState.isSubmitting && !!image.file}
							className="h-20 w-20 bg-blue-500 text-white"
						/>
						{image.file && <p className="text-info">Image selected! Click &quot;Save Changes&quot; to upload.</p>}
					</div>
					{/* Form */}
					<form onSubmit={(event) => void form.handleSubmit((formData) => submit(formData))(event)}>
						<FieldGroup>
							<div className="flex gap-6">
								<FormInputWrapper form={form} fieldConfig={profileFormConfig.firstName} />
								<FormInputWrapper form={form} fieldConfig={profileFormConfig.lastName} />
							</div>

							<FormInputWrapper form={form} fieldConfig={profileFormConfig.email} />

							<MfaReconfigureTrigger />
							<div className="flex flex-col items-end">
								{status.error && <p className="text-error">{status.error}</p>}

								{status.isSuccess ? (
									<div className="bg-success/10 text-success flex items-center gap-2 rounded-lg px-6 py-2">
										<CheckCircle className="h-4 w-4" /> Saved Successfully
									</div>
								) : (
									<Button type="submit" data-testid="save-changes-button" disabled={form.formState.isSubmitting}>
										{form.formState.isSubmitting ? "Saving..." : "Save Changes"}
									</Button>
								)}
							</div>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
