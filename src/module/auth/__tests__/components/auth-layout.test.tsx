import { render, screen } from "@testing-library/react";

import AuthLayout from "@/module/auth/components/auth-layout";
import { AUTH_PAGE_TYPE } from "@/module/auth/types";
import { authFooterConfig } from "@/module/auth/utils/constants";

const CHILD = "Screen content";

describe("AuthLayout component", () => {
	it("renders the screen it wraps", () => {
		render(<AuthLayout>{CHILD}</AuthLayout>);

		expect(screen.getByText(CHILD)).toBeInTheDocument();
	});

	describe("the social sign-in slot", () => {
		it("offers the social providers when the screen asks for them", () => {
			render(<AuthLayout showSocialAuth>{CHILD}</AuthLayout>);

			expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /continue with github/i })).toBeInTheDocument();
		});

		it("leaves them out otherwise", () => {
			render(<AuthLayout>{CHILD}</AuthLayout>);

			expect(screen.queryByRole("button", { name: /continue with/i })).not.toBeInTheDocument();
		});
	});

	describe("the footer slot", () => {
		it.each(Object.values(AUTH_PAGE_TYPE))("takes the %s footer from authFooterConfig", (type) => {
			const { text, linkText, href } = authFooterConfig[type];

			render(<AuthLayout type={type}>{CHILD}</AuthLayout>);

			expect(screen.getByText(text)).toBeInTheDocument();
			expect(screen.getByRole("link", { name: linkText })).toHaveAttribute("href", href);
		});

		it("renders no footer when the screen names no page type", () => {
			render(<AuthLayout>{CHILD}</AuthLayout>);

			expect(screen.queryByRole("link")).not.toBeInTheDocument();
		});
	});
});
