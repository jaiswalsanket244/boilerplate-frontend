"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { IPermissionSelectorProps, RolePermission } from "@/module/teams/types";
import { cn } from "@/lib/utils/class-names";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export function PermissionSelector({ permissions, value, onChange }: IPermissionSelectorProps) {
	const [searchTerm, setSearchTerm] = useState("");

	const filteredPermissions = useMemo(() => {
		const normalizedTerm = searchTerm.trim().toLowerCase();

		if (!normalizedTerm) {
			return permissions;
		}

		return permissions.filter((permission) =>
			`${permission.label} ${permission.description} ${permission.category} ${permission.id}`
				.toLowerCase()
				.includes(normalizedTerm)
		);
	}, [permissions, searchTerm]);

	const groupedPermissions = useMemo(() => {
		return filteredPermissions.reduce<Record<string, RolePermission[]>>((groups, permission) => {
			const [domain] = permission.id.includes(":") ? permission.id.split(":") : [permission.category || "Other"];
			const domainLabel =
				domain
					?.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" ") || "Other";
			groups[domainLabel] = [...(groups[domainLabel] ?? []), permission];
			return groups;
		}, {});
	}, [filteredPermissions]);

	const getResourceKey = (id: string) => {
		const parts = id.split(":");
		if (parts.length === 3) return `${parts[0]}:${parts[1]}`;
		if (parts.length === 2) return parts[0];
		return id;
	};

	const getAction = (id: string) => {
		const parts = id.split(":");
		return parts[parts.length - 1] || "view";
	};

	const getActionLevel = (action: string) => {
		switch (action) {
			case "manage":
				return 3;
			case "write":
				return 2;
			case "view":
				return 1;
			default:
				return 0;
		}
	};

	const isSubsumed = (permissionId: string, selectedIds: string[]): boolean => {
		if (!permissionId) return false;
		const resourceKey = getResourceKey(permissionId);
		const action = getAction(permissionId);
		const level = getActionLevel(action);

		return selectedIds.some((id) => {
			if (id === permissionId) return false;
			return getResourceKey(id) === resourceKey && getActionLevel(getAction(id)) > level;
		});
	};

	const togglePermission = (permissionId: string, checked: boolean) => {
		const resourceKey = getResourceKey(permissionId);
		let newValue = [...value];

		if (checked) {
			// Optimization: Remove other permissions for same resource, only keep highest
			newValue = newValue.filter((id) => getResourceKey(id) !== resourceKey);
			newValue.push(permissionId);
		} else {
			newValue = newValue.filter((item) => item !== permissionId);
		}
		onChange(Array.from(new Set(newValue)));
	};

	const formatPermissionLabel = (id: string, fallbackLabel: string) => {
		const parts = id.split(":");
		if (parts.length === 3 && parts[1] && parts[2]) {
			const scope = parts[1]
				?.split("-")
				.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
				.join(" ");
			const action = parts[2]?.charAt(0).toUpperCase() + parts[2]?.slice(1);
			return `${scope} ${action}`;
		}
		if (parts.length === 2 && parts[1]) {
			return parts[1]?.charAt(0).toUpperCase() + parts[1]?.slice(1);
		}
		return fallbackLabel;
	};

	return (
		<div className="space-y-4">
			<div className="relative">
				<Search className="text-txt-tertiary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<input
					placeholder="Search Permissions"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="border-border bg-muted focus:border-border h-10 w-full rounded-md border pl-10 text-sm focus:outline-hidden"
				/>
			</div>

			<ScrollArea className="h-100 pr-4">
				<div className="space-y-6">
					{Object.entries(groupedPermissions).map(([domainLabel, domainPermissions]) => {
						return (
							<div key={domainLabel} className="space-y-3">
								<div className="flex items-center justify-between">
									<h3 className="text-txt-primary text-sm font-semibold">{domainLabel}</h3>
								</div>

								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
									{domainPermissions.map((permission) => {
										const isExplicitlyChecked = value.includes(permission.id);
										const disabled = isSubsumed(permission.id, value);
										const isEffectivelyChecked = isExplicitlyChecked || disabled;
										const displayLabel = formatPermissionLabel(permission.id, permission.label);

										return (
											<div
												key={permission.id}
												className={cn(
													"border-border flex items-center gap-2 rounded-lg border p-3 transition-colors",
													isEffectivelyChecked && "bg-muted"
												)}
											>
												<Checkbox
													id={permission.id}
													checked={isEffectivelyChecked}
													disabled={disabled}
													onCheckedChange={(checked) => togglePermission(permission.id, checked === true)}
													className="border-border rounded"
												/>
												<label
													htmlFor={permission.id}
													className={cn(
														"text-txt-secondary cursor-pointer text-sm font-medium",
														disabled && "cursor-not-allowed opacity-70"
													)}
												>
													{displayLabel}
												</label>
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			</ScrollArea>
		</div>
	);
}
