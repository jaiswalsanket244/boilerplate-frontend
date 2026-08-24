vi.mock("@/components/ui/tooltip", () => ({
	Tooltip: ({ children }: any) => <div>{children}</div>,
	TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>,
	TooltipProvider: ({ children }: any) => <div>{children}</div>,
	TooltipTrigger: ({ children, asChild, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock("@/components/ui/avatar", () => ({
	Avatar: ({ children, className }: any) => (
		<div className={className} data-testid="avatar">
			{children}
		</div>
	),
	AvatarFallback: ({ children }: any) => <div data-testid="avatar-fallback">{children}</div>,
	AvatarImage: ({ src, alt, onError }: any) => <img src={src} alt={alt} data-testid="avatar-image" onError={onError} />,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
	DropdownMenu: ({ children, onOpenChange, ...props }: any) => <div {...props}>{children}</div>,
	DropdownMenuContent: ({ children, ...props }: any) => (
		<div {...props} data-testid="dropdown-content">
			{children}
		</div>
	),
	DropdownMenuItem: ({ children, onClick, ...props }: any) => (
		<button onClick={onClick} {...props}>
			{children}
		</button>
	),
	DropdownMenuTrigger: ({ children, asChild, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock("@/components/ui/select", () => {
	return {
		Select: ({ children, onValueChange, value, ...props }: any) => (
			<select value={value} onChange={(e) => onValueChange?.(e.target.value)} {...props}>
				{children}
			</select>
		),

		SelectTrigger: ({ children }: any) => <>{children}</>,
		SelectValue: ({ children, placeholder }: any) => <>{children || placeholder}</>,

		SelectContent: ({ children }: any) => <>{children}</>,

		SelectItem: ({ value, children }: any) => (
			<option value={value} data-testid={`option-${value}`}>
				{children}
			</option>
		),
	};
});
