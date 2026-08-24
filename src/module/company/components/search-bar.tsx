import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { useEffect, useMemo, useState } from "react";
import type { ISearchBarProps } from "@/module/company/types";

export function SearchBar({ onSearch, placeholder = "Search anything here...", debounceMs = 300 }: ISearchBarProps) {
	const [value, setValue] = useState<string>("");

	const debouncedSearch = useMemo(
		() =>
			debounce((searchValue: string) => {
				onSearch(searchValue);
			}, debounceMs),
		[onSearch, debounceMs]
	);

	// Cleanup: cancel any pending debounced calls when component unmounts or dependencies change
	useEffect(() => {
		return () => {
			debouncedSearch.cancel();
		};
	}, [debouncedSearch]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setValue(newValue);
		debouncedSearch(newValue);
	};

	return (
		<div className="mb-6 mt-6">
			<Input placeholder={placeholder} value={value} onChange={handleInputChange} data-testid="search-bar-input" />
		</div>
	);
}
