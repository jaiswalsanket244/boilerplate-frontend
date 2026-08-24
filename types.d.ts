declare interface AnyObject {
	[key: string]: any;
}

// Next.js only types CSS Modules (*.module.css); global/side-effect CSS imports need this.
declare module "*.css";

interface ChildProps {
	children: React.ReactNode;
}
