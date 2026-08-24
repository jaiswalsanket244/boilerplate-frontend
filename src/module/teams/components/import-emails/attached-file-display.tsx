import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import { formatFileSize } from "@/module/teams/utils/helpers";
import type { IAttachedFileDisplayProps } from "@/module/teams/types";

export const AttachedFileDisplay = ({ file, onRemove }: IAttachedFileDisplayProps) => (
	<div className="flex items-center justify-between rounded-lg border border-muted/80 bg-muted/30 p-3">
		<div className="flex items-center gap-3">
			<Paperclip className="h-4 w-4 text-muted-foreground" />
			<div>
				<p className="text-sm font-medium text-muted-foreground">{file.name}</p>
				<p className="text-xs text-muted-foreground/50">{formatFileSize(file.size)}</p>
			</div>
		</div>
		<Button variant="ghost" size="sm" type="button" onClick={onRemove} className="h-8 w-8 p-0 hover:bg-muted/80">
			<X className="h-4 w-4" />
		</Button>
	</div>
);
