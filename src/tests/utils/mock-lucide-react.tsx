vi.mock("lucide-react", () => {
	const toKebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

	const makeIcon = (testId: string) => {
		const Icon = () => <span data-testid={testId} />;
		return Icon;
	};

	const namedTestIds: Record<string, string> = {
		Loader2Icon: "loader2-icon",
		Loader2: "loader2-icon",
		EyeOff: "eye-off-icon",
		Eye: "eye-icon",
		EyeIcon: "eye-icon",
		Check: "check-icon",
		CheckCircle: "check-circle",
		ArrowLeft: "arrow-left",
		Trash2: "trash2-icon",
		Plus: "plus-icon",
		Upload: "upload-icon",
		Circle: "circle-icon",
		ChevronRight: "chevron-right-icon",
		ChevronLeft: "chevron-left-icon",
		ChevronDown: "chevron-down-icon",
		ChevronUp: "chevron-up-icon",
		Loader: "loader-icon",
		Search: "search-icon",
		Paperclip: "paperclip-icon",
		X: "x-icon",
		XIcon: "x-icon",
		MoreHorizontal: "more-horizontal-icon",
		UserCog: "user-cog-icon",
		UserMinus: "user-minus-icon",
		ShieldAlert: "shield-alert-icon",
		Undo: "undo-icon",
		MailX: "mail-x-icon",
		ArrowUpDown: "arrow-up-down-icon",
		ArrowUp: "arrow-up-icon",
		ArrowDown: "arrow-down-icon",
		Filter: "filter-icon",
		EditIcon: "edit-icon",
		CopyIcon: "copy-icon",
		DownloadIcon: "download-icon",
	};

	const cache = new Map<string, unknown>();

	return new Proxy(
		{ __esModule: true },
		{
			get(_target, prop) {
				if (prop === "__esModule") return true;
				/* Return undefined for `then`/`default` and symbol keys so the module
				   isn't mistaken for a thenable and interop probes don't get a stub. */
				if (typeof prop !== "string" || prop === "then" || prop === "default") return undefined;
				if (!cache.has(prop)) {
					const testId = namedTestIds[prop] ?? `${toKebab(prop)}${/icon$/i.test(prop) ? "" : "-icon"}`;
					cache.set(prop, makeIcon(testId));
				}
				return cache.get(prop);
			},
			has(_target, prop) {
				return typeof prop === "string" && prop !== "then";
			},
		}
	);
});
