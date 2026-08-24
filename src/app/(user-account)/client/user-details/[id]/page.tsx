"use client";
import { use } from "react";
import { useAdminUserAPI } from "@/module/teams/hooks/useAdminUser";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import type { ParamsType } from "@/module/profile/types/index";
import { useHandlers } from "@/module/teams/utils/handlers";
import { USER_STATUS } from "@/module/teams/types";

export default function UserDetailsPage(props: { params: Promise<ParamsType> }) {
	const params = use(props.params);
	const { useGetOneUserQuery } = useAdminUserAPI();
	const { data, isLoading, refetch } = useGetOneUserQuery(params.id);
	const userData = data?.data;

	const { handleDelete, handleUpdateStatus } = useHandlers();

	// Format date to DD/MM/YYYY
	const formatDate = (dateString?: string) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	};

	// Calculate days since joining
	const calculateDaysSince = (dateString?: string) => {
		if (!dateString) return 0;
		const joinDate = new Date(dateString);
		const today = new Date();
		const diffTime = Math.abs(today.getTime() - joinDate.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	if (isLoading)
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="text-txt-secondary-800 h-8 w-8 animate-spin" />
			</div>
		);

	const onDelete = async (id: string, status: string) => {
		try {
			await handleDelete(id, status);
			await refetch();
		} catch (error) {
			console.error(error);
		}
	};

	const onUpdateStatus = async (id: string, status: string) => {
		try {
			await handleUpdateStatus(id, status);
			await refetch();
		} catch (error) {
			console.error(error);
		}
	};

	const handleStatusChange = (id: string) => {
		if (userData?.status === USER_STATUS.DELETED) {
			void onUpdateStatus(id, USER_STATUS.ACTIVE);
			return;
		}

		void onDelete(id, USER_STATUS.DELETED);
	};

	return (
		<div className="bg-background">
			<div className="mb-8 flex items-center justify-between">
				<h1 className="text-foreground text-2xl font-semibold">{userData?.fullName}</h1>
				<Button size="sm" variant={"destructive"} onClick={() => handleStatusChange(userData?._id || "")}>
					{userData?.status === USER_STATUS.DELETED ? "Mark as Active" : "Remove User"}
				</Button>
			</div>

			<div className="items-start space-y-10">
				<Avatar className="h-24 w-24 shrink-0">
					<AvatarImage src={userData?.images?.[0]} alt={userData?.fullName} />
					<AvatarFallback className="bg-blue text-foreground text-xl font-semibold">
						{userData?.fullName
							?.split(" ")
							.map((n) => n[0])
							.join("") || "U"}
					</AvatarFallback>
				</Avatar>

				<div className="flex-1 space-y-4">
					<div className="space-y-4">
						<div className="flex items-center">
							<span className="text-txt-secondary-900 w-32 text-base font-bold">Status</span>
							<span className="text-txt-primary text-base capitalize">{userData?.status}</span>
						</div>

						<div className="flex items-center">
							<span className="text-txt-secondary-900 w-32 text-base font-bold">Email</span>
							<span className="text-txt-primary text-base">{userData?.email}</span>
						</div>

						<div className="flex items-center">
							<span className="text-txt-secondary-900 w-32 text-base font-bold">Role</span>
							<span className="text-txt-primary text-base capitalize">{userData?.roles}</span>
						</div>

						<div className="flex items-center">
							<span className="text-txt-secondary-900 w-32 text-base font-bold">Date of Joining</span>
							<span className="text-txt-primary text-base">
								{formatDate(userData?.createdAt)} ({calculateDaysSince(userData?.createdAt)} days)
							</span>
						</div>

						<div className="flex items-center">
							<span className="text-txt-secondary-900 w-32 text-base font-bold">Current Plan</span>
							<span className="text-txt-primary text-base">Pro Plan</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
