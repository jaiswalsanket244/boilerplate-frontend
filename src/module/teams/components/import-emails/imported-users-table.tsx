import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { IInviteUsersTableProps, IUserRowProps } from "@/module/teams/types";
import { Search, XIcon } from "lucide-react";

const UserRow = ({ user, displayIndex, onRemove }: IUserRowProps) => (
	<TableRow className="hover:bg-muted border-0">
		<TableCell className="text-muted-foreground px-4 py-3 text-sm font-medium">{displayIndex}</TableCell>
		<TableCell className="px-4 py-3">
			<div className="space-y-1">
				<Input
					value={user.email}
					readOnly
					className={`bg-input/40 text-sm ${
						user.errors?.some((e) => e.toLowerCase().includes("email")) ? "border-red-500" : ""
					}`}
					data-testid="email-input"
				/>
				{user.errors
					?.filter((e) => e.toLowerCase().includes("email"))
					.map((err, i) => (
						<p key={i} className="text-xs text-red-600">
							{err}
						</p>
					))}
			</div>
		</TableCell>
		<TableCell className="px-4 py-3">
			<div className="space-y-1">
				<Input
					value={user.firstName}
					readOnly
					className={`bg-input/40 text-sm ${
						user.errors?.some((e) => e.toLowerCase().includes("first")) ? "border-red-500" : ""
					}`}
					data-testid="first-name-input"
				/>
				{user.errors
					?.filter((e) => e.toLowerCase().includes("first"))
					.map((err, i) => (
						<p key={i} className="text-xs text-red-600">
							{err}
						</p>
					))}
			</div>
		</TableCell>
		<TableCell className="px-4 py-3">
			<div className="space-y-1">
				<Input
					value={user.lastName}
					readOnly
					className={`bg-input/40 text-sm ${
						user.errors?.some((e) => e.toLowerCase().includes("last")) ? "border-red-500" : ""
					}`}
					data-testid="last-name-input"
				/>
				{user.errors
					?.filter((e) => e.toLowerCase().includes("last"))
					.map((err, i) => (
						<p key={i} className="text-xs text-red-600">
							{err}
						</p>
					))}
			</div>
		</TableCell>
		<TableCell className="px-4 py-3 text-center">
			<Button
				variant="ghost"
				size="sm"
				type="button"
				onClick={() => onRemove(user.id)}
				className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
				data-testid="remove-user-button"
			>
				<XIcon className="h-4 w-4" />
			</Button>
		</TableCell>
	</TableRow>
);

export const UsersTable = ({
	users,
	filteredUsers,
	searchQuery,
	onSearchChange,
	onRemoveUser,
}: IInviteUsersTableProps) => (
	<div className="space-y-4">
		<div className="w-1/2">
			<div className="relative">
				<Search className="text-txt-primary-400 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<Input
					data-testid="search-user-input"
					placeholder="Search users..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="pl-10"
				/>
			</div>
		</div>

		<div className="overflow-hidden rounded-md border">
			<div className="max-h-96 overflow-y-auto">
				<Table className="w-full">
					<TableHeader className="bg-muted/40 sticky top-0">
						<TableRow className="border-b">
							<TableHead className="h-auto w-16 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-600 uppercase">
								S.No.
							</TableHead>
							<TableHead className="h-auto px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-600 uppercase">
								Email
							</TableHead>
							<TableHead className="h-auto px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-600 uppercase">
								First Name
							</TableHead>
							<TableHead className="h-auto px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-600 uppercase">
								Last Name
							</TableHead>
							<TableHead className="h-auto w-16 px-4 py-3"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="divide-muted/80 bg-muted/50 divide-y">
						{filteredUsers.length > 0 ? (
							filteredUsers.map((user) => {
								const displayIndex = users.findIndex((u) => u.id === user.id) + 1;
								return <UserRow key={user.id} user={user} displayIndex={displayIndex} onRemove={onRemoveUser} />;
							})
						) : (
							<TableRow>
								<TableCell colSpan={5} className="text-txt-primary-800 px-4 py-8 text-center">
									{searchQuery ? "No users found matching your search" : "No users to display"}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	</div>
);
