import type { ColumnDef } from "@tanstack/react-table";
import type { TeamMember } from "@/module/teams/types/index";
import { Badge } from "@/components/ui/badge";
import ActionsCell from "@/module/teams/components/action-cell";
import { USER_STATUS, type TAB_TYPE } from "@/module/teams/types";
import { ROLES, type IUser } from "@/types";
import Image from "next/image";

export const createColumns = (
	tabType: TAB_TYPE,
	canManageTeams: boolean,
	currentUser: IUser | null
): ColumnDef<TeamMember>[] => {
	const columns: ColumnDef<TeamMember>[] = [
		{
			accessorKey: "serialNumber",
			header: "S. No.",
			cell: ({ row }) => {
				return <div>{row.index + 1}.</div>;
			},
		},
		{
			accessorKey: "fullName",
			header: "User",
			cell: ({ row }) => {
				const name = row.original.name;
				const fullName = name ? `${name.first || ""} ${name.last || ""}`.trim() : "Test User";

				const email = row.original.email || row.original.invitedEmail;
				const images = row.original.images;

				const getInitials = (name: string): string => {
					if (!name) return "";
					return name
						.split(" ")
						.map((word) => word.charAt(0))
						.join("")
						.toUpperCase()
						.slice(0, 2);
				};

				const initials = getInitials(fullName);

				return (
					<div className="flex items-center space-x-3">
						<div className="shrink-0">
							{images ? (
								<Image
									src={images}
									alt={fullName || "User"}
									width={32}
									height={32}
									className="rounded-full object-cover"
									style={{ width: "32px", height: "32px" }}
								/>
							) : (
								<div className="text-txt-primary-800 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium">
									{initials}
								</div>
							)}
						</div>
						<div className="flex flex-col">
							<span className="text-txt-primary text-sm font-medium">{fullName || "Test User"}</span>
							<span className="text-txt-secondary text-sm">{email}</span>
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "role",
			header: "Role",
			enableColumnFilter: true,
			cell: ({ row }) => {
				const roles = row.original.invitedRole || row.original.role;
				const roleText = typeof roles === "string" ? roles : String(roles);

				const isAdmin = roleText === ROLES.ADMIN;
				const isUser = roleText === ROLES.USER;

				return (
					<Badge
						variant={!isAdmin ? "default" : "secondary"}
						className={
							isAdmin
								? "border-purple-100 bg-purple-50 text-purple-600"
								: isUser
									? "border-blue-100 bg-blue-50 text-blue-600"
									: "bg-muted text-txt-primary-900"
						}
					>
						{roleText}
					</Badge>
				);
			},
		},
		{
			accessorKey: "createdAt",
			header: "Date of Joining",
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, columnId, filterValue: { from?: string; to?: string }) => {
				const rawValue = row.getValue(columnId);
				const value = rawValue as string | number | Date;
				const rowDate = new Date(value);

				const fromDate = filterValue?.from ? new Date(filterValue.from) : null;
				const toDate = filterValue?.to ? new Date(filterValue.to) : null;

				if (isNaN(rowDate.getTime())) return false;

				const inRange = (!fromDate || rowDate >= fromDate) && (!toDate || rowDate <= toDate);

				return inRange;
			},
			cell: ({ row }) => {
				const rawDate = row.getValue("createdAt");
				const date =
					typeof rawDate === "string" || typeof rawDate === "number" || rawDate instanceof Date
						? new Date(rawDate)
						: null;

				if (!date || isNaN(date.getTime())) return "DD/MM/YY";

				const formattedDate = date.toLocaleDateString("en-GB", {
					day: "2-digit",
					month: "2-digit",
					year: "2-digit",
				});

				return <div>{formattedDate}</div>;
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.getValue("status");
				const statusText = typeof status === "string" ? status : String(status);
				const isActive = status === USER_STATUS.ACTIVE;
				const isInvited = status === USER_STATUS.PENDING;

				return (
					<Badge
						variant={isActive ? "default" : "secondary"}
						className={
							isActive
								? "bg-green-50 text-green-800 hover:bg-green-100"
								: isInvited
									? "bg-orange-100 text-orange-800 hover:bg-orange-200"
									: "bg-accent text-accent-foreground hover:bg-accent/80"
						}
					>
						{statusText}
					</Badge>
				);
			},
		},
	];

	columns.push({
		id: "actions",
		header: "Actions",
		cell: ({ row }) => (
			<ActionsCell row={row} tabType={tabType} canManageTeams={canManageTeams} currentUser={currentUser} />
		),
	});

	return columns;
};
