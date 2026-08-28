import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CardList from "@/module/cards/components/card-list";
import type { CardDetailsType } from "@/module/cards/types";

const useGetCardsQuery = vi.fn();
const useSetDefaultCardMutation = vi.fn(() => ({ mutate: vi.fn() }));

vi.mock("@/module/cards/hooks/useCards", () => ({
	useCardsAPI: () => ({ useGetCardsQuery, useSetDefaultCardMutation }),
}));

function makeCard(overrides: Partial<CardDetailsType["card"]> = {}): CardDetailsType {
	return {
		allow_redisplay: "always",
		billing_details: {
			address: { city: null, country: null, line1: null, line2: null, postal_code: null, state: null },
			email: null,
			name: "Test",
			phone: null,
			tax_id: null,
		},
		card: {
			brand: "visa",
			last4: "0000",
			exp_month: 12,
			exp_year: 2030,
			checks: { address_line1_check: null, address_postal_code_check: null, cvc_check: null },
			country: "US",
			fingerprint: "fp",
			funding: "credit",
			generated_from: null,
			installments: null,
			networks: { available: ["visa"], preferred: null },
			three_d_secure_usage: { supported: true },
			wallet: null,
			regulated_status: null,
			...overrides,
		},
		created: 0,
		customer: "cus_1",
		id: "pm_1",
		livemode: false,
		metadata: {},
		type: "card",
		object: "payment_method",
	};
}

function mockCards(cards: CardDetailsType[]) {
	useGetCardsQuery.mockReturnValue({
		data: { cards, defaultPaymentMethodId: null },
		isLoading: false,
		isError: false,
		refetch: vi.fn(),
	});
}

describe("CardList", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders a normal card with its last4 and no wallet badge", () => {
		mockCards([makeCard({ brand: "visa", last4: "4242" })]);

		render(<CardList />);

		expect(screen.getByText("visa")).toBeInTheDocument();
		expect(screen.getByText("**** **** **** 4242")).toBeInTheDocument();
		expect(screen.queryByText("Google Pay")).not.toBeInTheDocument();
		expect(screen.queryByText("Apple Pay")).not.toBeInTheDocument();
		expect(screen.queryByText("Wallet")).not.toBeInTheDocument();
	});

	it("renders a wallet card with a label and the funding card's dynamic_last4", () => {
		mockCards([
			makeCard({
				brand: "mastercard",
				last4: "1111", // tokenized device number (DPAN)
				wallet: { type: "google_pay", dynamic_last4: "5678", google_pay: {} },
			}),
		]);

		render(<CardList />);

		expect(screen.getByText("Google Pay")).toBeInTheDocument();
		expect(screen.getByText("**** **** **** 5678")).toBeInTheDocument();
		expect(screen.queryByText("**** **** **** 1111")).not.toBeInTheDocument();
	});

	it("falls back to last4 when a wallet card has no dynamic_last4", () => {
		mockCards([
			makeCard({
				brand: "visa",
				last4: "9999",
				wallet: { type: "apple_pay", dynamic_last4: null, apple_pay: {} },
			}),
		]);

		render(<CardList />);

		expect(screen.getByText("Apple Pay")).toBeInTheDocument();
		expect(screen.getByText("**** **** **** 9999")).toBeInTheDocument();
	});
});
