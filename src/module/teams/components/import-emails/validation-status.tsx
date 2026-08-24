import type { IValidationStatusProps } from "@/module/teams/types";

export const ValidationStatus = ({
	uploadStatus,
	errorMessage,
	validationResult,
	processingProgress,
}: IValidationStatusProps) => (
	<>
		{uploadStatus === "error" && errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

		{validationResult && (
			<>
				{validationResult.invalidRecords > 0 ? (
					<p className="text-sm text-red-600">
						{validationResult.invalidRecords} invalid {validationResult.invalidRecords === 1 ? "entry" : "entries"}{" "}
						found.
					</p>
				) : (
					<p className="text-sm text-green-600">All entries are valid and ready to invite.</p>
				)}
			</>
		)}

		{uploadStatus === "validating" && (
			<div className="space-y-2">
				<div className="text-sm text-gray-600">Validating data...</div>
				<div className="h-2 w-full max-w-xs rounded-full bg-gray-200">
					<div
						className="h-2 rounded-full bg-blue-600 transition-all duration-300"
						style={{ width: `${processingProgress}%` }}
					/>
				</div>
			</div>
		)}
	</>
);
