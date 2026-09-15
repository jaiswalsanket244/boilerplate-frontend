"use client";

import type { AxiosError } from "axios";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSessionsAPI } from "@/module/profile/hooks/useSessions";
import type { ISession } from "@/module/profile/types";

const sessionLabel = (session: ISession) =>
	[session.browser, session.os, session.device].filter(Boolean).join(" · ") || "Unknown device";

const formatLastActive = (lastActiveAt: string | null) => {
	if (!lastActiveAt) return "—";
	const date = new Date(lastActiveAt);
	if (Number.isNaN(date.getTime())) return "—";
	return formatDistanceToNow(date, { addSuffix: true });
};

const getErrorMessage = (error: unknown) => {
	const axiosError = error as AxiosError<{ message?: string }>;
	return (
		axiosError?.response?.data?.message ||
		(error instanceof Error ? error.message : "Something went wrong! Please try again.")
	);
};

export default function Sessions() {
	const { useGetSessions, useRevokeSession, useRevokeOtherSessions } = useSessionsAPI();
	const { data: sessions, isLoading, isError, error: fetchError } = useGetSessions();
	const revokeSession = useRevokeSession();
	const revokeOtherSessions = useRevokeOtherSessions();

	const [actionError, setActionError] = useState("");
	const [confirmOpen, setConfirmOpen] = useState(false);

	const otherSessions = (sessions ?? []).filter((session) => !session.isCurrent);

	const handleRevoke = (id: string) => {
		setActionError("");
		revokeSession.mutate(id, {
			onError: (error) => setActionError(getErrorMessage(error)),
		});
	};

	const handleRevokeOthers = () => {
		setActionError("");
		revokeOtherSessions.mutate(undefined, {
			onSuccess: () => setConfirmOpen(false),
			onError: (error) => {
				setConfirmOpen(false);
				setActionError(getErrorMessage(error));
			},
		});
	};

	return (
		<div className="max-w-3xl p-6">
			<Card>
				<CardHeader>
					<CardTitle>Active Sessions</CardTitle>
					<CardDescription>
						These are the devices currently signed in to your account. Signing out a device may take up to ~15 minutes
						to take full effect.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{isLoading ? (
						<div className="space-y-3" data-testid="sessions-loading">
							{Array.from({ length: 3 }).map((_, index) => (
								<Skeleton key={index} className="h-12 w-full" />
							))}
						</div>
					) : isError ? (
						<p className="text-red-600" role="alert">
							{getErrorMessage(fetchError)}
						</p>
					) : otherSessions.length === 0 && (sessions ?? []).length <= 1 ? (
						<p className="text-txt-secondary">Only this device is signed in.</p>
					) : (
						<>
							{actionError && (
								<p className="text-red-600" role="alert">
									{actionError}
								</p>
							)}
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Device</TableHead>
										<TableHead>IP address</TableHead>
										<TableHead>Last active</TableHead>
										<TableHead className="text-right">Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{(sessions ?? []).map((session) => (
										<TableRow key={session.id}>
											<TableCell>
												<div className="flex items-center gap-2">
													<span className="font-medium">{sessionLabel(session)}</span>
													{session.isCurrent && <Badge variant="secondary">This device</Badge>}
												</div>
											</TableCell>
											<TableCell>{session.ipDisplay || "—"}</TableCell>
											<TableCell>{formatLastActive(session.lastActiveAt)}</TableCell>
											<TableCell className="text-right">
												<Button
													variant="outline"
													size="sm"
													disabled={session.isCurrent || revokeSession.isPending}
													aria-label={`Sign out ${sessionLabel(session)}`}
													onClick={() => handleRevoke(session.id)}
												>
													Sign out
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

							{otherSessions.length > 0 && (
								<div className="flex justify-end pt-2">
									<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
										<AlertDialogTrigger asChild>
											<Button variant="destructive" disabled={revokeOtherSessions.isPending}>
												Sign out of all other sessions
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Sign out of all other sessions?</AlertDialogTitle>
												<AlertDialogDescription>
													This signs out every device except this one. A signed-out device may retain access for up to
													~15 minutes.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<Button
													variant="destructive"
													disabled={revokeOtherSessions.isPending}
													onClick={handleRevokeOthers}
												>
													Sign out other sessions
												</Button>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
