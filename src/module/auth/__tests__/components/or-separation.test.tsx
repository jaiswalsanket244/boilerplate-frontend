import { render, screen } from "@testing-library/react";

import OrSeparation from "@/module/auth/components/or-separation";

describe("OrSeparation component", () => {
	const renderSeparation = (props: { isCenter?: boolean } = {}) => {
		const { container } = render(<OrSeparation title="OR" {...props} />);

		return {
			wrapper: container.firstElementChild as HTMLElement,
			label: screen.getByText("OR"),
		};
	};

	it("renders the title it is given", () => {
		renderSeparation();

		expect(screen.getByText("OR")).toBeInTheDocument();
	});

	it("sits the label at the start of the rule by default", () => {
		const { wrapper, label } = renderSeparation();

		expect(wrapper).toHaveClass("justify-start");
		expect(label).toHaveClass("pe-2.5");
	});

	it("centres the label on the rule when asked to", () => {
		const { wrapper, label } = renderSeparation({ isCenter: true });

		expect(wrapper).toHaveClass("justify-center");
		expect(label).toHaveClass("p-2.5");
	});
});
