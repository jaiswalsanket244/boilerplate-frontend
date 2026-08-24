import { Input } from "@/components/ui/input";
import { type SearchBoxProps } from "@/types";
import { PiMagnifyingGlassBold } from "react-icons/pi";

const SearchBox: React.FC<SearchBoxProps> = ({ searchTerm, onSearchChange, ...props }) => {
	return (
		<div className="border-input bg-background flex items-center rounded-md border px-3">
			<span className="text-txt-primary-800">
				<PiMagnifyingGlassBold className="h-[18px] w-[18px]" />
			</span>
			<Input
				data-testid="search-box"
				value={searchTerm}
				onChange={(e) => onSearchChange(e.target.value)}
				className="h-10 border-none bg-transparent pl-4 text-sm shadow-none outline-hidden focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-hidden focus-visible:outline-offset-0"
				{...props}
			/>
		</div>
	);
};

export default SearchBox;
