"use client";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { CheckCircle, Loader2Icon } from "lucide-react";

import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage } from "@/lib/utils";
import { useCompanySettingsForm, useCompanySettingsSubmit } from "@/module/profile/hooks/useCompanySettings";
import { companySettingsFormConfig } from "@/module/profile/utils/company-settings-config";
import { Controller } from "react-hook-form";

import { Separator } from "@/components/ui/separator";
import { routes } from "@/config/routes";
import CompanyDangerZone from "@/module/profile/components/company-danger-zone";
import { useRouter } from "next/navigation";
import { canAccess } from "@/lib/utils/access-check";
import { PERMISSIONS } from "@/types/permission";
import { useProfileAPI } from "@/module/profile/hooks/useProfile";

export default function CompanySettings() {
	const router = useRouter();

	const { useGetUserData } = useProfileAPI();
	const { data: user } = useGetUserData();
	const permissions = user?.permissions ?? [];

	// Dynamically check if the user has admin-level dashboard privileges
	const hasCompanyManageAccess = canAccess(permissions, PERMISSIONS.COMPANY_MANAGE, true);

	const { form, isLoading, error } = useCompanySettingsForm();
	const { submit, status } = useCompanySettingsSubmit();

	const enablePasswordRotation = form.watch("enablePasswordRotation");

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

	if (!hasCompanyManageAccess) {
		router.push(routes.settings.profile);
		return null;
	}

	return (
		<div className="max-w-2xl space-y-8">
			<Card className="border-none shadow-none">
				<CardHeader>
					<CardTitle className="text-2xl font-semibold">Company Settings</CardTitle>
				</CardHeader>

				<CardContent className="space-y-6">
					<form onSubmit={(event) => void form.handleSubmit((formData) => submit(formData))(event)}>
						<FieldGroup>
							<FormInputWrapper form={form} fieldConfig={companySettingsFormConfig.supportEmail} />

							<div className="bg-background rounded-lg p-4 dark:bg-gray-800">
								<p className="mb-4 text-gray-500 dark:text-gray-300">PASSWORD ROTATION</p>

								<Controller
									name="enablePasswordRotation"
									control={form.control}
									render={({ field }) => (
										<div className="border-border flex flex-row items-center justify-between rounded-lg border bg-white p-4 dark:bg-black/60">
											<div className="space-y-0.5">
												<FieldLabel>Enable Password Rotation</FieldLabel>
												<FieldDescription>Require users to change their password periodically.</FieldDescription>
											</div>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</div>
									)}
								/>

								{enablePasswordRotation && (
									<div className="mt-4 flex gap-6">
										<FormInputWrapper
											form={form}
											fieldConfig={companySettingsFormConfig.passwordValidityDays}
											wrapperClassName="flex-1"
										/>
										<FormInputWrapper
											form={form}
											fieldConfig={companySettingsFormConfig.gracePeriodDays}
											wrapperClassName="flex-1"
										/>
									</div>
								)}
							</div>

							<div className="flex flex-col items-end pt-8">
								{status.error && <p className="text-error mb-4">{status.error}</p>}

								{status.isSuccess ? (
									<div className="bg-success/10 text-success flex items-center gap-2 rounded-lg px-6 py-2">
										<CheckCircle className="h-4 w-4" /> Saved Successfully
									</div>
								) : (
									<Button
										type="submit"
										data-testid="save-changes-button"
										disabled={form.formState.isSubmitting || !form.formState.isDirty}
									>
										{form.formState.isSubmitting ? "Saving..." : "Save Changes"}
									</Button>
								)}
							</div>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>

			<Separator />

			<CompanyDangerZone />
		</div>
	);
}
