import {
	ChangePasswordSchema,
	PasswordSchema,
	hasMinLength,
	hasNumber,
	hasSpecialChar,
	hasUpperAndLower,
} from "@/module/auth/utils/form-utils";

const VALID_PASSWORD = "Passw0rd!";

const confirmPasswordIssue = (result: ReturnType<typeof PasswordSchema.safeParse>) =>
	result.success ? undefined : result.error.issues.find((issue) => issue.path.includes("confirmPassword"));

describe("form-utils password predicates", () => {
	describe("hasUpperAndLower", () => {
		it("rejects a password with no lowercase letter", () => {
			expect(hasUpperAndLower("ALLUPPERCASE1!")).toBe(false);
		});

		it("rejects a password with no uppercase letter", () => {
			expect(hasUpperAndLower("alllowercase1!")).toBe(false);
		});

		it("rejects a password with no letters at all", () => {
			expect(hasUpperAndLower("12345678!")).toBe(false);
		});

		it("accepts a password containing both cases", () => {
			expect(hasUpperAndLower(VALID_PASSWORD)).toBe(true);
		});
	});

	describe("hasMinLength", () => {
		it.each([
			["", false],
			["Sevench", false],
			["Eightchr", true],
			["Ninechars", true],
		])("returns %s -> %s", (password, expected) => {
			expect(hasMinLength(password as string)).toBe(expected);
		});
	});

	describe("hasNumber", () => {
		it("rejects a password with no digit", () => {
			expect(hasNumber("Password!")).toBe(false);
		});

		it("accepts a password containing a digit", () => {
			expect(hasNumber(VALID_PASSWORD)).toBe(true);
		});
	});

	describe("hasSpecialChar", () => {
		it("rejects a password with no special character", () => {
			expect(hasSpecialChar("Password1")).toBe(false);
		});

		it.each(["@", "$", "%", "*", "&", "?", "!"])("accepts %s as a special character", (char) => {
			expect(hasSpecialChar(`Password1${char}`)).toBe(true);
		});
	});
});

describe("PasswordSchema", () => {
	it("accepts a strong password when both fields match", () => {
		const result = PasswordSchema.safeParse({
			password: VALID_PASSWORD,
			confirmPassword: VALID_PASSWORD,
		});

		expect(result.success).toBe(true);
	});

	it("rejects when confirmPassword does not match", () => {
		const result = PasswordSchema.safeParse({
			password: VALID_PASSWORD,
			confirmPassword: "Passw0rd!different",
		});

		expect(result.success).toBe(false);
		expect(confirmPasswordIssue(result)?.message).toBe("Passwords do not match");
	});

	it("reports the mismatch against the confirmPassword field", () => {
		const result = PasswordSchema.safeParse({
			password: VALID_PASSWORD,
			confirmPassword: "Mismatch1!",
		});

		expect(confirmPasswordIssue(result)?.path).toEqual(["confirmPassword"]);
	});

	it("treats a case difference as a mismatch", () => {
		const result = PasswordSchema.safeParse({
			password: VALID_PASSWORD,
			confirmPassword: VALID_PASSWORD.toUpperCase(),
		});

		expect(result.success).toBe(false);
	});

	it.each([
		["shorter than 8 characters", "Pw1!", "Password must be at least 8 characters"],
		["missing a mixed case", "password1!", "Password must contain uppercase and lowercase letters"],
		["missing a number", "Password!", "Password must contain at least one number"],
		["missing a special character", "Password1", "Password must contain at least one special character"],
	])("rejects a password %s", (_label, password, message) => {
		const result = PasswordSchema.safeParse({ password, confirmPassword: password });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.map((issue) => issue.message)).toContain(message);
		}
	});

	it("requires confirmPassword to be non-empty", () => {
		const result = PasswordSchema.safeParse({ password: VALID_PASSWORD, confirmPassword: "" });

		expect(result.success).toBe(false);
	});
});

describe("ChangePasswordSchema", () => {
	const base = {
		currentPassword: "OldPassw0rd!",
		password: VALID_PASSWORD,
		confirmPassword: VALID_PASSWORD,
	};

	it("accepts a valid change-password payload", () => {
		expect(ChangePasswordSchema.safeParse(base).success).toBe(true);
	});

	it("rejects when confirmPassword does not match", () => {
		const result = ChangePasswordSchema.safeParse({ ...base, confirmPassword: "Different1!" });

		expect(result.success).toBe(false);
		if (!result.success) {
			const issue = result.error.issues.find((i) => i.path.includes("confirmPassword"));
			expect(issue?.message).toBe("Passwords do not match");
		}
	});

	it("requires currentPassword", () => {
		const result = ChangePasswordSchema.safeParse({ ...base, currentPassword: "" });

		expect(result.success).toBe(false);
	});

	it("applies the same strength rules to the new password", () => {
		const result = ChangePasswordSchema.safeParse({
			...base,
			password: "weakpass",
			confirmPassword: "weakpass",
		});

		expect(result.success).toBe(false);
	});
});
