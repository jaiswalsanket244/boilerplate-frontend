import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { emailSchema, type IEmailFormProps, type TEmailFormData } from "@/module/profile/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

const EmailForm = ({ onSendEmail }: IEmailFormProps) => {
	const [isFailedToSendEmail, setIsFailedToSendEmail] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<TEmailFormData>({
		resolver: zodResolver(emailSchema),
		defaultValues: {
			cc: false,
			bcc: false,
			ccEmails: [],
			bccEmails: [],
			message: "",
		},
	});

	const ccChecked = watch("cc");
	const bccChecked = watch("bcc");

	const handleEmailsChange = useCallback((value: string, field: "ccEmails" | "bccEmails") => {
		const emails = value
			.split(",")
			.map((email) => email.trim())
			.filter((email) => email.length > 0);
		setValue(field, emails);
	}, []);

	const getEmailsDisplayValue = useCallback((emails: string[]) => {
		return emails.join(", ");
	}, []);

	const onSubmit = async (data: TEmailFormData) => {
		try {
			if (onSendEmail) {
				await onSendEmail({
					message: data.message,
					ccEmails: data.ccEmails,
					bccEmails: data.bccEmails,
				});
				reset();
			}
		} catch (error) {
			setIsFailedToSendEmail(true);

			setTimeout(() => {
				setIsFailedToSendEmail(false);
			}, 3000);
		}
	};

	const submit = (e: React.FormEvent) => {
		e.preventDefault();
		void handleSubmit(onSubmit)();
	};

	return (
		<div
			className={cn(
				"flex h-88 flex-col space-y-2 overflow-hidden rounded-lg border p-3 shadow-sm transition-colors duration-300",
				isFailedToSendEmail && "border-error ring-error bg-red-50/50"
			)}
		>
			<form onSubmit={submit} className="text-txt-primary flex h-full flex-1 flex-col" data-testid="email-form">
				<div className="flex-1 space-y-2 overflow-y-auto pr-4">
					<h3 className="text-base font-bold">Respond Via Email</h3>

					<div className="flex items-center justify-end gap-6">
						<div className="flex items-center space-x-2">
							<Checkbox
								id="cc"
								checked={ccChecked}
								onCheckedChange={(checked) => setValue("cc", !!checked)}
								className="size-4"
							/>
							<Label htmlFor="cc" className="cursor-pointer text-base font-bold">
								cc
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="bcc"
								checked={bccChecked}
								onCheckedChange={(checked) => setValue("bcc", !!checked)}
								className="size-4"
							/>
							<Label htmlFor="bcc" className="cursor-pointer text-base font-bold">
								bcc
							</Label>
						</div>
					</div>

					{ccChecked && (
						<div className="space-y-1.5">
							<Label className="text-sm">CC</Label>
							<Input
								placeholder="Enter email addresses separated by commas"
								defaultValue={getEmailsDisplayValue(watch("ccEmails"))}
								onChange={(e) => handleEmailsChange(e.target.value, "ccEmails")}
								className="bg-muted shadow-none outline-hidden focus-visible:border-none focus-visible:ring-0"
							/>
							{errors.ccEmails && (
								<p className="text-red text-sm italic">
									{errors.ccEmails?.map?.((error) => error?.message).join(", ")}
								</p>
							)}
						</div>
					)}

					{bccChecked && (
						<div className="space-y-1.5">
							<Label className="text-sm">BCC</Label>
							<Input
								placeholder="Enter email addresses separated by commas"
								defaultValue={getEmailsDisplayValue(watch("bccEmails"))}
								onChange={(e) => handleEmailsChange(e.target.value, "bccEmails")}
								className="bg-muted shadow-none outline-hidden focus-visible:border-none focus-visible:ring-0"
							/>
							{errors.bccEmails && (
								<p className="text-red text-sm italic">
									{errors.bccEmails?.map?.((error) => error?.message).join(", ")}
								</p>
							)}
						</div>
					)}

					<div className="space-y-1.5">
						<Label className="text-sm">Message</Label>
						<Textarea
							placeholder="Message"
							{...register("message")}
							className="border-border bg-muted focus-visible:border-border resize-none outline-hidden focus-visible:ring-0 focus-visible:ring-offset-0"
							rows={3}
						/>
						{errors.message && <p className="text-red text-sm italic">{errors.message.message}</p>}
					</div>
				</div>

				<div className="flex shrink-0 justify-end pt-4">
					<Button
						type="submit"
						disabled={isSubmitting || isFailedToSendEmail}
						className={cn(
							"bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm px-8 disabled:opacity-50",
							isFailedToSendEmail && "border-error bg-error"
						)}
					>
						{isSubmitting ? "Sending..." : isFailedToSendEmail ? "Failed to send email" : "Send Email"}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default EmailForm;
