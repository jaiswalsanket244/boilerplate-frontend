import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IManualUserEntry, UserInviteDetails } from "@/module/teams/types";
import { XIcon } from "lucide-react";

export default function ManualUserEntry({ users, setUsers }: IManualUserEntry) {
	const handleChange = (index: number, field: Exclude<keyof UserInviteDetails, "errors">, value: string) => {
		setUsers((prev) => {
			const updatedUsers = [...prev];
			if (updatedUsers[index]) {
				updatedUsers[index][field] = value;
			}

			return updatedUsers;
		});
	};

	const handleRemoveRow = (index: number) => {
		setUsers((users) => users.filter((_, i) => i !== index));
	};

	if (!users) return null;

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[60px]">S.No.</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>First Name</TableHead>
					<TableHead>Last Name</TableHead>
					<TableHead className="w-[40px]"></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{users.map(
					(user, index) =>
						user && (
							<TableRow data-testid={`user-row-${index + 1}`} key={index} className={user.errors ? "bg-red-50" : ""}>
								<TableCell>{index + 1}</TableCell>
								<TableCell>
									<Input
										type="email"
										value={user.email}
										onChange={(e) => handleChange(index, "email", e.target.value)}
										className={`${user.errors?.some((e) => e.toLowerCase().includes("email")) ? "border-red-300" : ""} bg-muted/70`}
										data-testid={`email-input-${index + 1}`}
									/>
									{user.errors
										?.filter((e) => e.toLowerCase().includes("email"))
										.map((error, i) => (
											<p key={i} className="mt-1 text-xs text-red-500">
												{error}
											</p>
										))}
								</TableCell>
								<TableCell>
									<Input
										type="text"
										value={user.firstName}
										onChange={(e) => handleChange(index, "firstName", e.target.value)}
										className={`${user.errors?.some((e) => e.toLowerCase().includes("first")) ? "border-red-300" : ""} bg-muted/70`}
										data-testid={`first-name-input-${index + 1}`}
									/>
									{user.errors
										?.filter((e) => e.toLowerCase().includes("first"))
										.map((error, i) => (
											<p key={i} className="mt-1 text-xs text-red-500">
												{error}
											</p>
										))}
								</TableCell>
								<TableCell>
									<Input
										type="text"
										value={user.lastName}
										onChange={(e) => handleChange(index, "lastName", e.target.value)}
										className={`${user.errors?.some((e) => e.toLowerCase().includes("last")) ? "border-red-300" : ""} bg-muted/70`}
										data-testid={`last-name-input-${index + 1}`}
									/>
									{user.errors
										?.filter((e) => e.toLowerCase().includes("last"))
										.map((error, i) => (
											<p key={i} className="mt-1 text-xs text-red-500">
												{error}
											</p>
										))}
								</TableCell>
								<TableCell>
									{users.length > 1 && (
										<Button
											variant="ghost"
											data-testid={`remove-row-button-${index + 1}`}
											onClick={() => handleRemoveRow(index)}
										>
											<XIcon className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-700" />
										</Button>
									)}
								</TableCell>
							</TableRow>
						)
				)}
			</TableBody>
		</Table>
	);
}
