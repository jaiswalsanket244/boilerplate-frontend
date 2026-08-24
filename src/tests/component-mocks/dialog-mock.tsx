vi.mock("@/components/ui/dialog", () => ({
	Dialog: ({ children, open, onOpenChange, ...props }: any) =>
		open ? (
			<div data-testid="dialog" {...props}>
				{children}
			</div>
		) : null,
	DialogContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
	DialogHeader: ({ children }: any) => <div>{children}</div>,
	DialogFooter: ({ children }: any) => <div>{children}</div>,
	DialogTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
	DialogDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
}));
