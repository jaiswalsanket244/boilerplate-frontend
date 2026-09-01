import {
	PASSWORD_MIN_LENGTH,
	PASSWORD_REQUIREMENTS,
	PASSWORD_SPECIAL_CHARS,
	hasMinLength,
	hasNumber,
	hasSpecialChar,
	hasUpperAndLower,
	strongPasswordSchema,
} from "@/lib/constants/password-policy";

const VALID_PASSWORD = "Passw0rd!";

describe("password-policy constants", () => {
	it("matches the backend policy byte-for-byte (min 8, @$%*&?!)", () => {
		expect(PASSWORD_MIN_LENGTH).toBe(8);
		expect(PASSWORD_SPECIAL_CHARS).toBe("@$%*&?!");
	});

	it("derives the checklist labels from the shared minimum length", () => {
		expect(PASSWORD_REQUIREMENTS.map((r) => r.label)).toEqual([
			"Minimum 8 characters",
			"Uppercase and lowercase",
			"At least one number",
			"At least one special character",
		]);
	});

	describe("predicates", () => {
		it.each([
			["Sevench", false],
			["Eightchr", true],
		])("hasMinLength(%s) -> %s", (password, expected) => {
			expect(hasMinLength(password)).toBe(expected);
		});

		it("hasUpperAndLower requires both cases", () => {
			expect(hasUpperAndLower("ALLUPPER1!")).toBe(false);
			expect(hasUpperAndLower("alllower1!")).toBe(false);
			expect(hasUpperAndLower(VALID_PASSWORD)).toBe(true);
		});

		it("hasNumber requires a digit", () => {
			expect(hasNumber("Password!")).toBe(false);
			expect(hasNumber(VALID_PASSWORD)).toBe(true);
		});

		it.each([...PASSWORD_SPECIAL_CHARS])("hasSpecialChar accepts %s", (char) => {
			expect(hasSpecialChar(`Password1${char}`)).toBe(true);
		});

		it("hasSpecialChar rejects a character outside the set", () => {
			expect(hasSpecialChar("Password1#")).toBe(false);
		});
	});

	describe("strongPasswordSchema", () => {
		it("accepts a password meeting every requirement", () => {
			expect(strongPasswordSchema.safeParse(VALID_PASSWORD).success).toBe(true);
		});

		it.each([
			["shorter than the minimum", "Pw1!", "Password must be at least 8 characters"],
			["missing a mixed case", "password1!", "Password must contain uppercase and lowercase letters"],
			["missing a number", "Password!", "Password must contain at least one number"],
			["missing a special character", "Password1", "Password must contain at least one special character"],
		])("rejects a password %s", (_label, password, message) => {
			const result = strongPasswordSchema.safeParse(password);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map((issue) => issue.message)).toContain(message);
			}
		});
	});
});
