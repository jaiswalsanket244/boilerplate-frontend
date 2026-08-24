"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUserCookies } from "@/lib/utils/cookies";
import { InviteUsersForm } from "@/module/teams/components/invite-users/invite-users-form";
import SendingInvitationStatusModal from "@/module/teams/components/send-invitation-modal";
import { useTeamAPI } from "@/module/teams/hooks/useTeam";
import type { PersonalInfoFormTypes } from "@/module/teams/types";
import { IMPORT_TYPE } from "@/module/teams/types";
import type { IInviteUserDialogProps, UserInviteDetails } from "@/module/teams/types/index";
import { ROLES } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";

export default function InviteUserDialog({ open, onOpenChange }: IInviteUserDialogProps) {
	const queryClient = useQueryClient();
	const pathname = usePathname();

	const { userType, companyRef: companyRefCookie } = getUserCookies();
	const companyRef = userType === ROLES.SUPER_ADMIN && pathname.includes("super-admin") ? "" : companyRefCookie;

	const { useInviteMultipleUser } = useTeamAPI();
	const form = useForm<PersonalInfoFormTypes>();

	const [users, setUsers] = useState<UserInviteDetails[]>([{ email: "", firstName: "", lastName: "" }]);
	const [showSendingModal, setShowSendingModal] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [activeTab, setActiveTab] = useState<string>(IMPORT_TYPE.manual);

	const { error } = useInviteMultipleUser;

	const onSubmit: SubmitHandler<PersonalInfoFormTypes> = () => {
		if (users.length === 0 || users.some((u) => !u.email.trim())) return;

		setShowSendingModal(true);
		useInviteMultipleUser.mutate(
			{ users, companyRef },
			{
				onSuccess: () => {
					void queryClient.invalidateQueries({ predicate: (query) => query.queryKey.includes("team-members") });
					void queryClient.invalidateQueries({ predicate: (query) => query.queryKey.includes("users-count") });

					setUsers([{ email: "", firstName: "", lastName: "" }]);

					onOpenChange(false); // Close the main modal
					setShowSuccessModal(true); // Show success modal
				},
			}
		);
	};

	const resetState = () => {
		setUsers([{ email: "", firstName: "", lastName: "" }]);
		setActiveTab(IMPORT_TYPE.manual);
		form.reset();
	};

	const handleCancel = () => {
		resetState();
		onOpenChange(false);
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			resetState();
		}
		onOpenChange(isOpen);
	};

	const handleAddRows = (count: number) => {
		const newUsers = Array(count)
			.fill(null)
			.map(() => ({ email: "", firstName: "", lastName: "" }));
		setUsers([...users, ...newUsers]);
	};

	const handleSuccessModalClose = () => {
		setShowSuccessModal(false);
		setShowSendingModal(false);
	};

	const allValid = users.length > 0 && users.every((u) => !u.errors || u.errors.length === 0);

	return (
		<>
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
					<DialogHeader>
						<DialogTitle>Invite User(s)</DialogTitle>
						<DialogHeader>
							<div className="text-txt-secondary-900 mb-4 text-sm">
								You can either add a user through their emails or import an .xlsx file having columns - Name and Email.
								<Button variant="link" type="button" className="h-auto p-0 text-blue-600">
									Download Template
								</Button>
							</div>
						</DialogHeader>
					</DialogHeader>
					<div className="p-6">
						<FormProvider {...form}>
							<form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
								<div className="text-txt-primary-800 flex flex-col gap-4">
									<InviteUsersForm
										users={users}
										setUsers={setUsers}
										activeTab={activeTab}
										setActiveTab={setActiveTab}
									/>
								</div>
								{error && (
									<p className="text-error mt-5 text-right text-sm">
										{error.response?.data?.message ?? "Failed to invite users"}
									</p>
								)}
								<div className="mt-5 flex flex-wrap items-center justify-between gap-3">
									{activeTab === IMPORT_TYPE.manual && (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button data-testid="add-row-dropdown" variant="outline" type="button" className="w-fit">
													Add Row(s) <ChevronDown className="ml-2 h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuItem onClick={() => handleAddRows(1)}>One Row</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleAddRows(5)}>5 Rows</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleAddRows(10)}>10 Rows</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									)}

									<div className="ml-auto flex gap-3">
										<Button className="w-auto" variant="outline" type="button" onClick={handleCancel}>
											Cancel
										</Button>
										<Button type="submit" disabled={useInviteMultipleUser.isPending || !allValid}>
											Invite User(s)
										</Button>
									</div>
								</div>
							</form>
						</FormProvider>
					</div>
				</DialogContent>
			</Dialog>

			<SendingInvitationStatusModal
				open={showSendingModal}
				isSuccess={showSuccessModal}
				onClose={handleSuccessModalClose}
			/>
		</>
	);
}
