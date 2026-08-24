vi.mock("@/components/ui/alert-dialog", () => ({
	AlertDialog: ({ children, open, onOpenChange }: any) => {
		return (
			<div data-testid="alert-dialog" data-open={open} onClick={() => onOpenChange(!open)}>
				{children}
			</div>
		);
	},
	AlertDialogCancel: ({ children, ...props }: any) => (
		<button {...props} data-testid="alert-dialog-cancel">
			{children}
		</button>
	),
	AlertDialogContent: ({ children }: any) => <div data-testid="alert-content">{children}</div>,
	AlertDialogDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>,
	AlertDialogFooter: ({ children }: any) => <div data-testid="alert-footer">{children}</div>,
	AlertDialogHeader: ({ children }: any) => <div data-testid="alert-header">{children}</div>,
	AlertDialogTitle: ({ children }: any) => <h2 data-testid="alert-title">{children}</h2>,
	AlertDialogTrigger: ({ children, asChild }: any) => <div data-testid="alert-trigger">{children}</div>,
	AlertDialogAction: ({ children, ...props }: any) => (
		<button {...props} data-testid="alert-dialog-action">
			{children}
		</button>
	),
}));
