import ResetPasswordForm from "@/module/auth/templates/reset-password-form";
import { Suspense } from "react";

export default function ResetPasswordPage() {
	return (
		<Suspense>
			<ResetPasswordForm />
		</Suspense>
	);
}
