import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import type { ISendingInvitationStatusModalProps } from "@/module/teams/types/index";

export default function SendingInvitationStatusModal({ open, isSuccess, onClose }: ISendingInvitationStatusModalProps) {
	return (
		<Dialog open={open} onOpenChange={onClose} data-testid="sending-invitation-status-modal">
			<DialogContent className="rounded-xl p-8">
				{!isSuccess ? (
					<>
						<h2 className="mb-2 text-3xl font-semibold">Sending your invitations..</h2>
						<div className="flex justify-between gap-3">
							<p className="text-txt-secondary-900 text-lg">This may take a while..</p>

							<div className="shrink-0 p-4">
								<Image
									src="/assets/svg/airplane.svg"
									alt="Sending"
									width={150}
									height={150}
									className="object-contain"
								/>
							</div>
						</div>
					</>
				) : (
					<>
						<div className="py-5">
							<h2 className="mb-4 text-2xl font-semibold">Invitation(s) Sent Successfully!</h2>

							<div className="mb-8 flex items-start justify-between">
								<p className="text-txt-secondary-900 mt-3 flex-1">
									Your invitation(s) are on their way! You&apos;ll be notified once they&apos;re accepted.
								</p>
								<div className="shrink-0">
									<Image src="/assets/svg/tick.svg" alt="Success" width={64} height={64} className="h-20 w-20" />
								</div>
							</div>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
