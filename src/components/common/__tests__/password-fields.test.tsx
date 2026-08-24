import { render, screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { vi } from "vitest";

import PasswordFields from "@/components/common/password/password-fields";
import type { PasswordFormData } from "@/module/auth/utils/form-utils";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
	const methods = useForm<PasswordFormData>({
		defaultValues: { password: "", confirmPassword: "" },
	});
	return <FormProvider {...methods}>{children}</FormProvider>;
};

const renderComponent = () => {
	return render(
		<Wrapper>
			<PasswordFields />
		</Wrapper>
	);
};

describe("PasswordFields Component", () => {
	let user: UserEvent;

	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	test("renders password & confirm password fields", () => {
		renderComponent();

		expect(screen.getByLabelText("Password")).toBeInTheDocument();
		expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
	});

	test("shows password requirements initially as invalid", () => {
		renderComponent();

		expect(screen.getByText(/minimum 8 characters/i)).toHaveClass("text-txt-secondary-800");
		expect(screen.getByText(/uppercase and lowercase/i)).toHaveClass("text-txt-secondary-800");
		expect(screen.getByText(/at least one number/i)).toHaveClass("text-txt-secondary-800");
		expect(screen.getByText(/at least one special character/i)).toHaveClass("text-txt-secondary-800");
	});

	test("updates requirement indicators as password becomes valid", async () => {
		renderComponent();

		const input = screen.getByLabelText("Password");

		await user.type(input, "Abc1234!");

		expect(screen.getByText(/minimum 8 characters/i)).toHaveClass("text-green-600");
		expect(screen.getByText(/uppercase and lowercase/i)).toHaveClass("text-green-600");
		expect(screen.getByText(/at least one number/i)).toHaveClass("text-green-600");
		expect(screen.getByText(/at least one special character/i)).toHaveClass("text-green-600");
	});

	test("shows 'Password Strength: Good' when all rules satisfied", async () => {
		renderComponent();

		await user.type(screen.getByLabelText("Password"), "Abc1234!");

		expect(screen.getByText(/password strength: good/i)).toBeInTheDocument();
	});

	test("shows 'Passwords match' when confirm matches", async () => {
		renderComponent();

		await user.type(screen.getByLabelText("Password"), "Abc1234!");
		await user.type(screen.getByLabelText("Confirm Password"), "Abc1234!");

		expect(screen.getByText(/passwords match/i)).toBeInTheDocument();
	});

	test("does NOT show 'Passwords match' if confirm is different", async () => {
		renderComponent();

		await user.type(screen.getByLabelText("Password"), "Abc1234!");
		await user.type(screen.getByLabelText("Confirm Password"), "WrongPass!");

		expect(screen.queryByText(/passwords match/i)).not.toBeInTheDocument();
	});

	test("does not show strength indicator when password is weak", async () => {
		renderComponent();

		await user.type(screen.getByLabelText("Password"), "abc");

		expect(screen.queryByText(/password strength/i)).not.toBeInTheDocument();
	});
});
