import { passwordFormSchema } from "@/module/profile/types";

const base = {
	currentPassword: "OldPass1!",
	newPassword: "NewPass1!",
	confirmedPassword: "NewPass1!",
};

describe("passwordFormSchema", () => {
	it("accepts a payload meeting the canonical policy", () => {
		expect(passwordFormSchema.safeParse(base).success).toBe(true);
	});

	it("keeps currentPassword present-only (min 1, no strength rules)", () => {
		expect(passwordFormSchema.safeParse({ ...base, currentPassword: "old" }).success).toBe(true);
		expect(passwordFormSchema.safeParse({ ...base, currentPassword: "" }).success).toBe(false);
	});

	it.each([
		["shorter than the minimum length", "Pw1!", "Password must be at least 8 characters"],
		["missing a mixed case", "password1!", "Password must contain uppercase and lowercase letters"],
		["missing a number", "Password!", "Password must contain at least one number"],
		["missing a special character", "Password1", "Password must contain at least one special character"],
	])("rejects a new password %s", (_label, newPassword, message) => {
		const result = passwordFormSchema.safeParse({ ...base, newPassword, confirmedPassword: newPassword });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.map((issue) => issue.message)).toContain(message);
		}
	});

	it("rejects when confirmedPassword does not match", () => {
		const result = passwordFormSchema.safeParse({ ...base, confirmedPassword: "Different1!" });

		expect(result.success).toBe(false);
		if (!result.success) {
			const issue = result.error.issues.find((i) => i.path.includes("confirmedPassword"));
			expect(issue?.message).toBe("Passwords do not match");
		}
	});
});
