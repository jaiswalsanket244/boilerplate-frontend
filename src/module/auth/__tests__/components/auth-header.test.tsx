import { render, screen } from "@testing-library/react";
import { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider";

import AuthHeader from "@/module/auth/components/auth-header";

describe("AuthHeader Component", () => {
	const renderComponent = (props: any) => render(<AuthHeader {...props} />, { wrapper: MemoryRouterProvider });

	it("renders title always", () => {
		renderComponent({ title: "Login" });

		expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
	});

	it("does NOT render description block when description, linkText, linkHref are missing", () => {
		renderComponent({ title: "Login" });

		expect(screen.queryByText(/instead/i)).not.toBeInTheDocument();
	});

	it("does NOT render the description block when only the description is missing", () => {
		renderComponent({ title: "Login", linkText: "Sign Up", linkHref: "/sign-up" });

		expect(screen.queryByRole("link")).not.toBeInTheDocument();
		expect(screen.queryByText(/instead/i)).not.toBeInTheDocument();
	});

	it("does NOT render the description block when only the link text is missing", () => {
		renderComponent({ title: "Login", description: "Don't have an account?", linkHref: "/sign-up" });

		expect(screen.queryByText("Don't have an account?")).not.toBeInTheDocument();
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
	});

	it("does NOT render the description block when only the link href is missing", () => {
		renderComponent({ title: "Login", description: "Don't have an account?", linkText: "Sign Up" });

		expect(screen.queryByText("Don't have an account?")).not.toBeInTheDocument();
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
	});

	it("renders description and first link when required props provided", () => {
		renderComponent({
			title: "Login",
			description: "Don't have an account?",
			linkText: "Sign Up",
			linkHref: "/sign-up",
		});

		expect(screen.getByText("Don't have an account?")).toBeInTheDocument();

		const anchor = screen.getByRole("link", { name: /sign up/i });
		expect(anchor).toBeInTheDocument();
		expect(anchor).toHaveAttribute("href", "/sign-up");
	});

	it('shows "instead" when second link is NOT provided', () => {
		renderComponent({
			title: "Login",
			description: "Don't have an account?",
			linkText: "Sign Up",
			linkHref: "/sign-up",
		});

		expect(screen.getByText(/instead/i)).toBeInTheDocument();
	});

	it('shows "or" when second link is provided', () => {
		renderComponent({
			title: "Login",
			description: "Have an account?",
			linkText: "Sign In",
			linkHref: "/sign-in",
			secondLinkText: "Reset Password",
			secondLinkHref: "/reset",
		});

		expect(screen.getByText("or")).toBeInTheDocument();
		expect(screen.queryByText(/instead/i)).not.toBeInTheDocument();
	});

	it("renders the second link when provided", () => {
		renderComponent({
			title: "Login",
			description: "Have an account?",
			linkText: "Sign In",
			linkHref: "/sign-in",
			secondLinkText: "Reset Password",
			secondLinkHref: "/reset",
		});

		const link = screen.getByRole("link", { name: /reset password/i });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "/reset");
	});

	it("does NOT render second link if text provided but no href", () => {
		renderComponent({
			title: "Login",
			description: "Have an account?",
			linkText: "Sign In",
			linkHref: "/sign-in",
			secondLinkText: "Reset Password",
			secondLinkHref: undefined, // missing
		});

		expect(screen.queryByRole("link", { name: /reset password/i })).not.toBeInTheDocument();
	});
});
