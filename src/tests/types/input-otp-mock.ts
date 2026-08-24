import type { ComponentPropsWithoutRef, KeyboardEventHandler, ReactNode } from "react";

import type { InputOTP } from "@/components/ui/input-otp";

export type InputOTPMockProps = {
	value?: string;
	onChange?: (value: string) => void;
	onKeyDown?: KeyboardEventHandler;
	id?: string;
	children?: ReactNode;
	"data-testid"?: string;
};

export type InputOTPGroupMockProps = {
	children?: ReactNode;
};

export type InputOTPSlotMockProps = {
	index: number;
};

type ModelledProp = Exclude<keyof InputOTPMockProps, "data-testid">;
type AssertPropExists<T extends keyof ComponentPropsWithoutRef<typeof InputOTP>> = T;
export type _ModelledPropsStillExist = AssertPropExists<ModelledProp>;
