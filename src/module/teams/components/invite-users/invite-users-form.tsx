"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IMPORT_TYPE } from "@/module/teams/types";
import type { MultiUserInputType } from "@/module/teams/types/index";
import ManualUserEntry from "@/module/teams/components/invite-users/manual-user-entry";
import ExcelUserImport from "@/module/teams/components/invite-users/excel-user-import";

export function InviteUsersForm({ users, setUsers, activeTab, setActiveTab }: MultiUserInputType) {
	return (
		<div className="flex flex-col gap-4">
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value={IMPORT_TYPE.manual}>Add Manually</TabsTrigger>
					<TabsTrigger value={IMPORT_TYPE.import}>Import from Excel</TabsTrigger>
				</TabsList>

				{/* Manual Entry Tab */}
				<TabsContent value={IMPORT_TYPE.manual} className="space-y-4">
					<ManualUserEntry users={users} setUsers={setUsers} />
				</TabsContent>

				{/* Import from Excel Tab */}
				<TabsContent value={IMPORT_TYPE.import} className="space-y-4">
					<ExcelUserImport users={users} setUsers={setUsers} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
