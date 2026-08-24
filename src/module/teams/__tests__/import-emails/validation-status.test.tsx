import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ValidationStatus } from "@/module/teams/components/import-emails/validation-status";
import type { ValidationResult } from "@/module/teams/types";

describe("ValidationStatus Component", () => {
	function renderComponent(props?: Partial<React.ComponentProps<typeof ValidationStatus>>) {
		return render(
			<ValidationStatus
				uploadStatus="error"
				errorMessage="File upload failed"
				validationResult={null}
				processingProgress={0}
				{...props}
			/>
		);
	}

	describe("Error State", () => {
		it("should display error message when uploadStatus is error", () => {
			renderComponent();

			expect(screen.getByText("File upload failed")).toBeInTheDocument();
		});

		it("should not display error message when uploadStatus is not error", () => {
			renderComponent({ uploadStatus: "idle" });

			expect(screen.queryByText("File upload failed")).not.toBeInTheDocument();
		});

		it("should not display error message when errorMessage is empty", () => {
			renderComponent({ errorMessage: "" });

			const errorElements = document.querySelectorAll(".text-red-600");
			expect(errorElements.length).toBe(0);
		});

		it("should apply correct styling to error message", () => {
			const { container } = renderComponent();

			const errorMessage = container.querySelector(".text-red-600");
			expect(errorMessage).toHaveClass("text-sm");
		});
	});

	describe("Validation Result - Invalid Records", () => {
		it("should display invalid records message for single invalid entry", () => {
			const validationResult: ValidationResult = {
				valid: false,
				errors: [],
				totalRecords: 10,
				validRecords: 9,
				invalidRecords: 1,
			};

			renderComponent({
				uploadStatus: "complete",
				errorMessage: "",
				validationResult,
				processingProgress: 100,
			});

			expect(screen.getByText("1 invalid entry found.")).toBeInTheDocument();
		});

		it("should display invalid records message for multiple invalid entries", () => {
			const validationResult: ValidationResult = {
				valid: false,
				errors: [],
				totalRecords: 10,
				validRecords: 7,
				invalidRecords: 3,
			};

			renderComponent({
				uploadStatus: "complete",
				errorMessage: "",
				validationResult,
				processingProgress: 100,
			});

			expect(screen.getByText("3 invalid entries found.")).toBeInTheDocument();
		});

		it("should apply correct styling to invalid records message", () => {
			const validationResult: ValidationResult = {
				valid: false,
				errors: [],
				totalRecords: 10,
				validRecords: 9,
				invalidRecords: 1,
			};

			const { container } = renderComponent({
				uploadStatus: "complete",
				errorMessage: "",
				validationResult,
				processingProgress: 100,
			});

			const invalidMessage = container.querySelector(".text-red-600");
			expect(invalidMessage).toHaveClass("text-sm");
		});
	});

	describe("Validation Result - All Valid", () => {
		it("should display success message when all entries are valid", () => {
			const validationResult: ValidationResult = {
				valid: true,
				errors: [],
				totalRecords: 10,
				validRecords: 10,
				invalidRecords: 0,
			};

			renderComponent({
				uploadStatus: "complete",
				errorMessage: "",
				validationResult,
				processingProgress: 100,
			});

			expect(screen.getByText("All entries are valid and ready to invite.")).toBeInTheDocument();
		});

		it("should apply correct styling to success message", () => {
			const validationResult: ValidationResult = {
				valid: true,
				errors: [],
				totalRecords: 10,
				validRecords: 10,
				invalidRecords: 0,
			};

			const { container } = renderComponent({
				uploadStatus: "complete",
				errorMessage: "",
				validationResult,
				processingProgress: 100,
			});

			const successMessage = container.querySelector(".text-green-600");
			expect(successMessage).toHaveClass("text-sm");
		});

		it("should not display invalid message when all entries are valid", () => {
			const validationResult: ValidationResult = {
				valid: true,
				errors: [],
				totalRecords: 10,
				validRecords: 10,
				invalidRecords: 0,
			};

			renderComponent({
				uploadStatus: "complete",
				errorMessage: "",
				validationResult,
				processingProgress: 100,
			});

			expect(screen.queryByText(/invalid/)).not.toBeInTheDocument();
		});
	});

	describe("Validating State", () => {
		it("should display validating message", () => {
			render(
				<ValidationStatus uploadStatus="validating" errorMessage="" validationResult={null} processingProgress={50} />
			);

			expect(screen.getByText("Validating data...")).toBeInTheDocument();
		});

		it("should set correct progress bar width", () => {
			const { container } = render(
				<ValidationStatus uploadStatus="validating" errorMessage="" validationResult={null} processingProgress={75} />
			);

			const progressBar = container.querySelector(".bg-blue-600") as HTMLElement;
			expect(progressBar.style.width).toBe("75%");
		});

		it("should handle 0% progress", () => {
			const { container } = render(
				<ValidationStatus uploadStatus="validating" errorMessage="" validationResult={null} processingProgress={0} />
			);

			const progressBar = container.querySelector(".bg-blue-600") as HTMLElement;
			expect(progressBar.style.width).toBe("0%");
		});

		it("should handle 100% progress", () => {
			const { container } = render(
				<ValidationStatus uploadStatus="validating" errorMessage="" validationResult={null} processingProgress={100} />
			);

			const progressBar = container.querySelector(".bg-blue-600") as HTMLElement;
			expect(progressBar.style.width).toBe("100%");
		});

		it("should not display validation result during validation", () => {
			render(
				<ValidationStatus uploadStatus="validating" errorMessage="" validationResult={null} processingProgress={50} />
			);

			expect(screen.queryByText("All entries are valid and ready to invite.")).not.toBeInTheDocument();
		});
	});

	describe("Multiple States", () => {
		it("should display both error and validation result", () => {
			const validationResult: ValidationResult = {
				valid: false,
				errors: [],
				totalRecords: 10,
				validRecords: 9,
				invalidRecords: 1,
			};

			render(
				<ValidationStatus
					uploadStatus="error"
					errorMessage="Upload error"
					validationResult={validationResult}
					processingProgress={0}
				/>
			);

			expect(screen.getByText("Upload error")).toBeInTheDocument();
			expect(screen.getByText("1 invalid entry found.")).toBeInTheDocument();
		});

		it("should prioritize validating state over validation result", () => {
			const validationResult: ValidationResult = {
				valid: true,
				errors: [],
				totalRecords: 10,
				validRecords: 10,
				invalidRecords: 0,
			};

			render(
				<ValidationStatus
					uploadStatus="validating"
					errorMessage=""
					validationResult={validationResult}
					processingProgress={50}
				/>
			);

			expect(screen.getByText("Validating data...")).toBeInTheDocument();
			// Validation result should still be shown
			expect(screen.getByText("All entries are valid and ready to invite.")).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle null validationResult", () => {
			render(
				<ValidationStatus uploadStatus="complete" errorMessage="" validationResult={null} processingProgress={100} />
			);

			expect(screen.queryByText(/invalid/)).not.toBeInTheDocument();
			expect(screen.queryByText(/valid/)).not.toBeInTheDocument();
		});

		it("should handle undefined validationResult", () => {
			render(
				<ValidationStatus
					uploadStatus="complete"
					errorMessage=""
					validationResult={undefined as any}
					processingProgress={100}
				/>
			);

			expect(screen.queryByText(/invalid/)).not.toBeInTheDocument();
			expect(screen.queryByText(/valid/)).not.toBeInTheDocument();
		});

		it("should handle very large invalid record count", () => {
			const validationResult: ValidationResult = {
				valid: false,
				errors: [],
				totalRecords: 10000,
				validRecords: 0,
				invalidRecords: 10000,
			};

			render(
				<ValidationStatus
					uploadStatus="complete"
					errorMessage=""
					validationResult={validationResult}
					processingProgress={100}
				/>
			);

			expect(screen.getByText("10000 invalid entries found.")).toBeInTheDocument();
		});
	});

	describe("Upload Status States", () => {
		it("should not display anything for idle status", () => {
			const { container } = render(
				<ValidationStatus uploadStatus="idle" errorMessage="" validationResult={null} processingProgress={0} />
			);

			expect(container.textContent).toBe("");
		});

		it("should not display anything for uploading status", () => {
			const { container } = render(
				<ValidationStatus uploadStatus="uploading" errorMessage="" validationResult={null} processingProgress={0} />
			);

			expect(container.textContent).toBe("");
		});

		it("should not display anything for parsing status", () => {
			const { container } = render(
				<ValidationStatus uploadStatus="parsing" errorMessage="" validationResult={null} processingProgress={0} />
			);

			expect(container.textContent).toBe("");
		});

		it("should not display validation UI for complete status without validation result", () => {
			render(
				<ValidationStatus uploadStatus="complete" errorMessage="" validationResult={null} processingProgress={100} />
			);

			expect(screen.queryByText("Validating data...")).not.toBeInTheDocument();
		});
	});
});
