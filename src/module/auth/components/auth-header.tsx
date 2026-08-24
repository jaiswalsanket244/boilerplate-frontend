import React from "react";
import Link from "next/link";

interface AuthHeaderProps {
	title: string;
	description?: string;
	linkText?: string;
	linkHref?: string;
	secondLinkText?: string;
	secondLinkHref?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
	title,
	description,
	linkText,
	linkHref,
	secondLinkText,
	secondLinkHref,
}) => {
	return (
		<div className="mb-10 space-y-2 bg-background">
			<h1 className="text-[32px] font-bold leading-10 text-foreground">{title}</h1>
			{description && linkText && linkHref && (
				<div className="flex flex-wrap gap-2 leading-4">
					<p className="text-base font-normal text-foreground/80">{description} </p>
					<div className="flex items-center gap-2">
						<Link href={linkHref} className="font-inter font-normal text-foreground underline underline-offset-4">
							{linkText}
						</Link>
						{linkHref && secondLinkHref ? <span>or</span> : <span>instead</span>}
						{secondLinkText && secondLinkHref && (
							<Link
								href={secondLinkHref}
								className="font-inter font-normal text-foreground underline underline-offset-4"
							>
								{secondLinkText}
							</Link>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default AuthHeader;
