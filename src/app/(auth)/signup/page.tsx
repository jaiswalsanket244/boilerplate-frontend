import SignUpForm from "@/module/auth/templates/sign-up-form";
import { Suspense } from "react";

export default function SignUp() {
	return (
		<Suspense>
			<SignUpForm />
		</Suspense>
	);
}
