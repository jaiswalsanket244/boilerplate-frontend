"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PermissionSelector } from "@/module/teams/components/permission-selector";
import { useRolesApi } from "@/module/teams/hooks/useRoles";
import {
	ROLE_FORM_MODE,
	type IRoleFormViewProps,
	type RoleFormValues,
	type RolePermission,
} from "@/module/teams/types";
import { createRoleSlug, roleFormSchema, toRoleFormValues } from "@/module/teams/utils/roles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type UseFormReturn, useWatch } from "react-hook-form";

type Step = 1 | 2 | 3;

// --- Sub-components ---

interface StepProps {
	form: UseFormReturn<RoleFormValues>;
	mode: ROLE_FORM_MODE;
}

const RoleDetailsStep = ({ form, mode }: StepProps) => {
	const {
		register,
		formState: { errors },
	} = form;
	const descriptionValue = useWatch({ control: form.control, name: "description" }) || "";

	return (
		<div className="space-y-6 py-4">
			<div className="space-y-2">
				<h3 className="text-txt-primary text-lg font-semibold">Add role details</h3>
			</div>
			<div className="space-y-4">
				<div className="space-y-2">
					<label className="text-txt-secondary text-sm font-medium">Role Name</label>
					<Input
						{...register("name")}
						placeholder="Enter role name"
						className="border-border bg-muted h-12 focus-visible:ring-0"
					/>
					{errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
				</div>
				<div className="space-y-2">
					<label className="text-txt-secondary text-sm font-medium">Role Slug</label>
					<Input
						{...register("slug")}
						placeholder="enter-role-slug"
						disabled={mode === ROLE_FORM_MODE.EDIT}
						className="border-border bg-muted h-12 font-mono focus-visible:ring-0"
					/>
					{errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
				</div>
				<div className="space-y-2">
					<div className="flex justify-between">
						<label className="text-txt-secondary text-sm font-medium">Role Description</label>
						<span className="text-txt-tertiary text-xs">{descriptionValue.length}/240</span>
					</div>
					<Textarea
						{...register("description")}
						placeholder="Describe what this role is intended to do"
						className="border-border bg-muted min-h-30 resize-none focus-visible:ring-0"
						maxLength={240}
					/>
					{errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
				</div>
			</div>
		</div>
	);
};

interface PermissionStepProps extends StepProps {
	permissions: RolePermission[];
	selectedPermissions: string[];
}

const PermissionSelectionStep = ({ permissions, selectedPermissions, form }: PermissionStepProps) => {
	const {
		setValue,
		formState: { errors },
	} = form;

	return (
		<div className="space-y-6 py-4">
			<div className="flex items-center justify-between">
				<h3 className="text-txt-primary text-lg font-semibold">Select Permissions</h3>
				<span className="text-txt-tertiary text-sm">
					{selectedPermissions.length} of {permissions.length} selected
				</span>
			</div>
			<PermissionSelector
				permissions={permissions}
				value={selectedPermissions}
				onChange={(val) => setValue("permissions", val, { shouldDirty: true, shouldValidate: true })}
				error={errors.permissions?.message}
			/>
		</div>
	);
};

const RolePreviewStep = ({ form, permissions, selectedPermissions }: PermissionStepProps) => {
	const nameValue = useWatch({ control: form.control, name: "name" });
	const slugValue = useWatch({ control: form.control, name: "slug" });
	const descriptionValue = useWatch({ control: form.control, name: "description" });

	return (
		<div className="space-y-6 py-4">
			<div className="space-y-2">
				<h3 className="text-txt-primary text-lg font-semibold">Preview</h3>
			</div>
			<div className="border-border bg-muted grid grid-cols-2 gap-8 rounded-xl border p-6">
				<div className="space-y-1">
					<p className="text-txt-tertiary text-xs">Role Name</p>
					<p className="text-txt-primary font-medium">{nameValue}</p>
				</div>
				<div className="space-y-1">
					<p className="text-txt-tertiary text-xs">Role Slug</p>
					<p className="text-txt-primary font-medium">{slugValue}</p>
				</div>
				<div className="col-span-2 space-y-1">
					<p className="text-txt-tertiary text-xs">Role Description</p>
					<p className="text-txt-secondary text-sm">{descriptionValue || "No description provided."}</p>
				</div>
			</div>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h4 className="text-txt-primary font-semibold">Permissions</h4>
					<span className="text-txt-tertiary text-sm">
						{selectedPermissions.length} of {permissions.length} selected
					</span>
				</div>
				<div className="grid max-h-75 grid-cols-1 gap-3 overflow-y-auto pr-2 sm:grid-cols-2">
					{selectedPermissions.map((pId) => {
						const p = permissions.find((perm) => perm.id === pId);
						return (
							<div key={pId} className="border-border bg-card flex items-center gap-2 rounded-lg border p-3">
								<div className="bg-primary flex h-5 w-5 shrink-0 items-center justify-center rounded">
									<Check className="h-3 w-3 text-white" />
								</div>
								<span className="text-txt-secondary truncate text-sm font-medium">{p?.label || pId}</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

// --- Main Component ---

export default function RoleFormView({ open, role, mode, onClose }: IRoleFormViewProps) {
	const queryClient = useQueryClient();
	const [step, setStep] = useState<Step>(1);
	const { usePermissionList, useCreateRoleMutation, useUpdateRoleMutation } = useRolesApi();
	const { data: permissions = [] } = usePermissionList();

	const createRoleMutation = useCreateRoleMutation();
	const updateRoleMutation = useUpdateRoleMutation();

	const form = useForm<RoleFormValues>({
		resolver: zodResolver(roleFormSchema),
		defaultValues: toRoleFormValues(role ?? undefined),
		mode: "onChange",
	});

	const { control, handleSubmit, setValue, reset } = form;
	const nameValue = useWatch({ control, name: "name" });
	const selectedPermissions = useWatch({ control, name: "permissions" }) ?? [];

	useEffect(() => {
		if (open) {
			reset(toRoleFormValues(role ?? undefined));
			setStep(1);
		}
	}, [open, role, reset]);

	useEffect(() => {
		if (mode === ROLE_FORM_MODE.CREATE && nameValue && step === 1) {
			setValue("slug", createRoleSlug(nameValue), { shouldValidate: true });
		}
	}, [nameValue, mode, setValue, step]);

	const onSubmit = async (values: RoleFormValues) => {
		try {
			if (mode === ROLE_FORM_MODE.EDIT && role?.slug) {
				await updateRoleMutation.mutateAsync({
					slug: role.slug,
					roleData: values,
				});
			} else {
				await createRoleMutation.mutateAsync({ ...values, slug: values.slug });
			}

			await queryClient.invalidateQueries({ queryKey: ["roles"] });
			onClose();
		} catch (error) {
			console.error("Failed to save role:", error);
		}
	};

	const nextStep = async () => {
		if (step === 1) {
			const isStep1Valid = await form.trigger(["name", "slug", "description"]);
			if (isStep1Valid) setStep(2);
		} else if (step === 2) {
			setStep(3);
		}
	};

	const prevStep = () => {
		if (step > 1) setStep((step - 1) as Step);
	};

	const renderStepContent = () => {
		switch (step) {
			case 1:
				return <RoleDetailsStep form={form} mode={mode} />;
			case 2:
				return (
					<PermissionSelectionStep
						form={form}
						mode={mode}
						permissions={permissions}
						selectedPermissions={selectedPermissions}
					/>
				);
			case 3:
				return (
					<RolePreviewStep
						form={form}
						mode={mode}
						permissions={permissions}
						selectedPermissions={selectedPermissions}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<Dialog open={open} onOpenChange={(val) => !val && onClose()}>
			<DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border-none p-0">
				<DialogHeader className="border-border flex flex-row items-center justify-between border-b p-6">
					<DialogTitle className="text-primary text-xl font-bold">
						{mode === ROLE_FORM_MODE.EDIT ? "Edit Role" : "New Role"}
					</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto px-6">{renderStepContent()}</div>

				<div className="border-border/50 bg-card flex items-center justify-between border-t px-6 py-4">
					<div className="text-txt-tertiary text-sm">{step}/3</div>
					<div className="flex gap-3">
						{step > 1 && (
							<Button variant="outline" onClick={prevStep} className="text-txt-secondary border-border">
								Back
							</Button>
						)}
						<Button variant="ghost" onClick={onClose} className="text-txt-secondary font-lato">
							Cancel
						</Button>
						{step < 3 ? (
							<Button onClick={nextStep} className="bg-primary hover:bg-primary text-primary-foreground min-w-25">
								Next
							</Button>
						) : (
							<Button
								onClick={handleSubmit(onSubmit)}
								disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
								className="min-w-25"
							>
								{createRoleMutation.isPending || updateRoleMutation.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : mode === ROLE_FORM_MODE.EDIT ? (
									"Update Role"
								) : (
									"Add Role"
								)}
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
