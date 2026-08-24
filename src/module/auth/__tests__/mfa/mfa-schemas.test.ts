import { mfaDeviceActivationSchema, mfaRecoveryCodeSchema, mfaRecoverySchema } from "@/module/auth/utils/mfa-schemas";

describe("mfaRecoverySchema", () => {
	it("accepts the form once the codes are acknowledged", () => {
		expect(mfaRecoverySchema.safeParse({ savedCodes: true }).success).toBe(true);
	});

	it("rejects the form while the acknowledgement is unchecked", () => {
		const result = mfaRecoverySchema.safeParse({ savedCodes: false });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe("You must confirm that you have saved your recovery codes.");
		}
	});

	it("rejects a missing acknowledgement", () => {
		expect(mfaRecoverySchema.safeParse({}).success).toBe(false);
	});
});

describe("mfaDeviceActivationSchema", () => {
	it("accepts a six digit code", () => {
		expect(mfaDeviceActivationSchema.safeParse({ code: "123456" }).success).toBe(true);
	});

	it.each([
		["five digits", "12345"],
		["seven digits", "1234567"],
		["letters", "12345a"],
		["empty", ""],
	])("rejects %s", (_label, code) => {
		expect(mfaDeviceActivationSchema.safeParse({ code }).success).toBe(false);
	});
});

describe("mfaRecoveryCodeSchema", () => {
	it("accepts a non-empty recovery code", () => {
		expect(mfaRecoveryCodeSchema.safeParse({ recoveryCode: "ABCD-1234" }).success).toBe(true);
	});

	it("trims surrounding whitespace", () => {
		const result = mfaRecoveryCodeSchema.safeParse({ recoveryCode: "  ABCD-1234  " });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.recoveryCode).toBe("ABCD-1234");
		}
	});

	it("rejects a whitespace-only recovery code", () => {
		expect(mfaRecoveryCodeSchema.safeParse({ recoveryCode: "   " }).success).toBe(false);
	});

	it("rejects an empty recovery code", () => {
		expect(mfaRecoveryCodeSchema.safeParse({ recoveryCode: "" }).success).toBe(false);
	});
});
