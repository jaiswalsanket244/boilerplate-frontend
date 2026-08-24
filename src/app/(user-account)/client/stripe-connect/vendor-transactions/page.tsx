"use client";

import AllVendorTransactions from "@/module/stripe-connect/templates/all-vendor-transactions";

// This page displays all the transactions related to a particular vendor
// including the transactions that are pending, transferred and failed.
export default function AllVendorTransactionsPage() {
	return <AllVendorTransactions />;
}
