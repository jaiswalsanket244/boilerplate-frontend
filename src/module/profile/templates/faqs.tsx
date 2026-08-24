import { CollapsibleSection } from "@/components/common/collapse-section";

const faqs = [
	{
		title: "Q1. Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
		content:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio praesent libero sed cursus ante dapibus diam. Sed nisi nulla quis sem at nibh elementum imperdiet.",
	},
	{
		title: "Q2. Integer nec odio praesent libero sed cursus ante dapibus diam?",
		content:
			"Integer nec odio praesent libero sed cursus ante dapibus diam. Duis sagittis ipsum praesent mauris fusce nec tellus sed. Curabitur suscipit tellus maecenas pellentesque felis. In hac habitasse platea, dictumst phasellus auctor or ci et nisi vulputate nonummy.",
	},
	{
		title: "Q3. Sed nisi nulla quis sem at nibh elementum imperdiet?",
		content:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio praesent libero sed cursus ante dapibus diam. Sed nisi nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum praesent mauris fusce nec tellus sed. Curabitur suscipit tellus maecenas pellentesque felis. In hac habitasse platea, dictumst phasellus auctor or ci et nisi vulputate nonummy.",
	},
	{
		title: "Q4. Integer nec odio praesent libero sed cursus ante dapibus diam?",
		content:
			"Integer nec odio praesent libero sed cursus ante dapibus diam. Duis sagittis ipsum praesent mauris fusce nec tellus sed. Curabitur suscipit tellus maecanas pellentesque felis. In hac habitasse platea, dictumst phasellus auctor or ci et nisi vulputate nonummy.",
	},
	{
		title: "Q5. Integer nec odio praesent libero sed cursus ante dapibus diam?",
		content:
			"Integer necdio praesent libero sed cursus ante dapibus diam. Duis sagittis ipsum praesent mauris fusce nec tellus sed. Curabitur suscipit tellus maecanas pellentesque felis. In hac habitasse platea, dictumst phasellus auctor or ci et nisi vulputate nonummy.",
	},
];

const Faqs = () => {
	return (
		<div className="h-full space-y-4 overflow-y-auto">
			<h2 className="text-txt-primary">FAQs</h2>
			{faqs.map((faq, index) => (
				<CollapsibleSection
					key={index}
					title={faq.title}
					defaultOpen={index === 0}
					collapseClassName="bg-background"
					titleClassName="text-txt-primary"
				>
					<p className="text-base text-txt-primary">{faq.content}</p>
				</CollapsibleSection>
			))}
		</div>
	);
};

export default Faqs;
