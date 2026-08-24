import VendorOnboarding from "@/module/stripe-connect/templates/vendor-onboarding";

type ParamsType = {
	accountId: string;
};

export default async function VendorOnboardingPage(props: { params: Promise<ParamsType> }) {
	const params = await props.params;
	return <VendorOnboarding accountId={params.accountId} />;
}
