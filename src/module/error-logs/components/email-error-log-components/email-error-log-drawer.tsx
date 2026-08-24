"use client";

import { FiEye } from "react-icons/fi";
import { type ErrorLogInfo } from "@/module/error-logs/types";
import { useState } from "react";
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTrigger } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EmailErrorLogDrawer({ errorLogInfo }: { errorLogInfo: ErrorLogInfo }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<TooltipProvider>
			<Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
				<Tooltip>
					<TooltipTrigger asChild>
						<DrawerTrigger asChild>
							<span className="cursor-pointer rounded-md p-2">
								<FiEye />
							</span>
						</DrawerTrigger>
					</TooltipTrigger>
				</Tooltip>

				<DrawerContent className="ml-auto h-full w-full max-w-2xl overflow-y-auto border-l bg-white p-4 shadow-lg">
					<DrawerClose className="absolute right-4 top-4 text-txt-secondary-800 hover:text-txt-primary">✕</DrawerClose>
					<DrawerHeader>
						<h2 className="border-b pb-2 text-lg font-semibold">Additional Details</h2>
					</DrawerHeader>
					<Tabs defaultValue="stack" className="w-full">
						<TabsList className="mb-2 gap-2 rounded-md border border-black p-1">
							<TabsTrigger value="stack">Stack Trace</TabsTrigger>
						</TabsList>

						{/* Error stack trace */}
						<TabsContent value="stack">
							<pre className="overflow-x-auto whitespace-pre-wrap rounded bg-gray-900 p-4 text-sm text-gray-100">
								{errorLogInfo?.stackTrace}
							</pre>
						</TabsContent>
					</Tabs>
				</DrawerContent>
			</Drawer>
		</TooltipProvider>
	);
}
