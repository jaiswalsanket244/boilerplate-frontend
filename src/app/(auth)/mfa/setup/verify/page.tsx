"use client";

import MfaVerificationForm from "@/module/auth/templates/mfa/mfa-verification-form";

export default function MfaSetupVerificationPage() {
	return <MfaVerificationForm isSetupFlow={true} />;
}
