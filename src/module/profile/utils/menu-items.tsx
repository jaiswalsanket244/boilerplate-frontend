import { routes } from "@/config/routes";
import type { MenuItem } from "@/module/profile/types";
import { PERMISSIONS } from "@/types/permission";
import { AlertTriangle, BellIcon, Briefcase, Building, Mail, Package2Icon, ShieldCheck, UserCog } from "lucide-react";
import { AiOutlineSetting } from "react-icons/ai";
import { BsBoxSeam, BsQuestionSquareFill } from "react-icons/bs";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { MdPayments } from "react-icons/md";
import { PiChatTeardropText, PiUserSwitch } from "react-icons/pi";
import { RxDashboard } from "react-icons/rx";
import { TbReceiptDollar } from "react-icons/tb";
import { VscLink } from "react-icons/vsc";

export const isRouteActive = (pathname: string, href: string) => pathname === href;
export const isSubMenuActive = (pathname: string, subs?: MenuItem[]) => subs?.some((s) => pathname === s.href);

export const settingsMenuItems: MenuItem[] = [
	{
		name: "Profile Settings",
		href: routes.settings.profile,
		Icon: <UserCog className="h-5 w-5" />,
	},
	{
		name: "Company Settings",
		href: routes.settings.company,
		Icon: <Building className="h-5 w-5" />,
		permissions: [PERMISSIONS.COMPANY_MANAGE],
	},
	{
		name: "Change Password",
		href: routes.settings.changePassword,
		Icon: <ShieldCheck className="h-5 w-5" />,
	},
	{
		name: "Faqs",
		href: routes.settings.faqs,
		Icon: <BsQuestionSquareFill className="h-5 w-5" />,
	},
	{
		name: "Notifications",
		href: routes.settings.notifications,
		Icon: <BellIcon className="h-5 w-5" />,
	},
	{
		name: "Contact Us",
		href: routes.settings.contactUs,
		Icon: <Mail className="h-5 w-5" />,
		permissions: [PERMISSIONS.USER_QUERY_WRITE],
	},
];

export const clientMenuItems: MenuItem[] = [
	{
		href: routes.dashboard,
		name: "Dashboard",
		Icon: <RxDashboard />,
		permissions: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.DASHBOARD_MANAGE],
	},
	{
		href: routes.products.list,
		name: "Products",
		Icon: <AiOutlineSetting />,
		permissions: [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_MANAGE],
	},
	{
		href: routes.subscriptions,
		name: "Subscriptions",
		Icon: <TbReceiptDollar />,
		permissions: [PERMISSIONS.SUBSCRIPTION_VIEW, PERMISSIONS.SUBSCRIPTION_MANAGE],
	},
	{
		href: routes.teams,
		name: "Teams",
		Icon: <HiOutlineUserGroup />,
		permissions: [PERMISSIONS.TEAMS_VIEW, PERMISSIONS.TEAMS_MANAGE],
	},
	{
		href: routes.stripeConnect.main,
		name: "Stripe Connect",
		Icon: <VscLink />,
		subItems: [
			{
				href: routes.stripeConnect.main,
				name: "Overview",
				Icon: <RxDashboard />,
				permissions: [PERMISSIONS.STRIPE_CONNECT_ONBOARDING_MANAGE],
			},
			{
				href: routes.stripeConnect.productList,
				name: "Stripe Products",
				Icon: <BsBoxSeam />,
				permissions: [PERMISSIONS.STRIPE_CONNECT_PRODUCTS_VIEW, PERMISSIONS.STRIPE_CONNECT_PRODUCTS_MANAGE],
			},
			{
				href: routes.stripeConnect.transactions,
				name: "Transactions",
				Icon: <MdPayments />,
				permissions: [PERMISSIONS.STRIPE_CONNECT_TRANSACTIONS_MANAGE],
			},
			{
				href: routes.stripeConnect.myOrders,
				name: "Orders",
				Icon: <MdPayments />,
				permissions: [PERMISSIONS.STRIPE_CONNECT_ORDERS_VIEW],
			},
		],
	},
	{
		href: "",
		name: "Stripe Payment",
		Icon: <VscLink />,

		subItems: [
			{
				href: routes.stripePayment.main,
				name: "Overview",
				Icon: <RxDashboard />,
				permissions: [PERMISSIONS.STRIPE_PAYMENT_DASHBOARD],
			},
			{
				href: routes.stripePayment.productList,
				name: "Products",
				Icon: <BsBoxSeam />,
				permissions: [PERMISSIONS.STRIPE_PAYMENT_PRODUCTS_VIEW, PERMISSIONS.STRIPE_PAYMENT_PRODUCTS_MANAGE],
			},
			{
				href: routes.stripePayment.transactions,
				name: "Transactions",
				Icon: <MdPayments />,
				permissions: [PERMISSIONS.STRIPE_PAYMENT_TRANSACTIONS_MANAGE],
			},
			{
				href: routes.stripePayment.orders,
				name: "Orders",
				Icon: <MdPayments />,
				permissions: [PERMISSIONS.STRIPE_PAYMENT_ORDERS_VIEW],
			},
			{
				href: routes.stripePayment.coupons.list,
				name: "Coupons",
				Icon: <Package2Icon />,
				permissions: [PERMISSIONS.STRIPE_PAYMENT_COUPONS_VIEW],
			},
		],
	},
	{
		href: routes.chat,
		name: "Chat",
		Icon: <PiChatTeardropText />,
		permissions: [PERMISSIONS.CHAT_VIEW, PERMISSIONS.CHAT_MANAGE],
	},
	{
		href: routes.auditLogs.list,
		name: "Audit Logs",
		Icon: <ShieldCheck />,
		permissions: [PERMISSIONS.AUDIT_LOGS_VIEW],
	},
	{
		href: routes.settings.profile,
		name: "Settings",
		Icon: <AiOutlineSetting />,
	},
	{
		href: routes.queries,
		name: "Queries",
		Icon: <RxDashboard />,
		permissions: [PERMISSIONS.USER_QUERY_MANAGE],
	},
	{
		href: routes.cards.list,
		name: "Cards",
		Icon: <TbReceiptDollar />,
		permissions: [PERMISSIONS.CARDS_VIEW, PERMISSIONS.CARDS_MANAGE],
	},
	{
		href: "/client/user-details",
		name: "User Details",
		Icon: <UserCog />,
		permissions: [PERMISSIONS.TEAMS_VIEW, PERMISSIONS.TEAMS_MANAGE],
		hidden: true,
	},
	{
		href: routes.stripePayment.coupons.create,
		name: "Create Coupon",
		Icon: <Package2Icon />,
		permissions: [PERMISSIONS.STRIPE_PAYMENT_COUPONS_VIEW],
		hidden: true,
	},
];

export const superAdminMenuItems: MenuItem[] = [
	{
		href: routes.superAdmin.dashboard,
		name: "Dashboard",
		Icon: <RxDashboard />,
	},
	{
		href: routes.superAdmin.companies.list,
		name: "Companies",
		Icon: <PiUserSwitch />,
	},
	{
		href: routes.superAdmin.stripeTransactions,
		name: "Stripe Transactions",
		Icon: <MdPayments />,
	},
	{
		href: routes.superAdmin.stripeConnect.vendors,
		name: "Stripe Vendors",
		Icon: <MdPayments />,
	},
	{
		href: routes.superAdmin.auditLogs.list,
		name: "Audit Logs",
		Icon: <ShieldCheck />,
		permissions: [PERMISSIONS.AUDIT_LOGS_VIEW],
	},
	{
		href: routes.superAdmin.settings,
		name: "Settings",
		Icon: <AiOutlineSetting />,
	},
];

/* System-role menu — access is gated by role on the backend, so these items
   carry no per-item permissions. */
export const systemMenuItems: MenuItem[] = [
	{
		href: routes.system.errorLogs.generic,
		name: "Error Logs",
		Icon: <AlertTriangle className="h-5 w-5" />,
	},
	{
		href: routes.system.errorLogs.email,
		name: "Email Logs",
		Icon: <Mail className="h-5 w-5" />,
	},
	{
		href: routes.system.jobs,
		name: "Jobs",
		Icon: <Briefcase className="h-5 w-5" />,
	},
	{
		href: routes.settings.profile,
		name: "Settings",
		Icon: <AiOutlineSetting className="h-5 w-5" />,
	},
];

// menu items to show super-admin while impersonating the company
export const impersonateAdminMenuItems: MenuItem[] = [
	{
		href: routes.dashboard,
		name: "Dashboard",
		Icon: <RxDashboard />,
	},
	{
		href: routes.products.list,
		name: "Products",
		Icon: <AiOutlineSetting />,
	},
	{
		href: routes.subscriptions,
		name: "Subscriptions",
		Icon: <TbReceiptDollar />,
	},
	{
		href: routes.teams,
		name: "Teams",
		Icon: <HiOutlineUserGroup />,
	},
	{
		href: "",
		name: "Stripe Connect",
		Icon: <VscLink />,
		subItems: [
			{
				href: routes.stripeConnect.main,
				name: "Overview",
				Icon: <RxDashboard />,
			},
			{
				href: routes.stripeConnect.productList,
				name: "Stripe Products",
				Icon: <BsBoxSeam />,
			},
			{
				href: routes.stripeConnect.transactions,
				name: "Payments",
				Icon: <MdPayments />,
			},
		],
	},
	{
		href: "",
		name: "Stripe Payment",
		Icon: <VscLink />,
		subItems: [
			{
				href: routes.stripePayment.main,
				name: "Overview",
				Icon: <RxDashboard />,
			},
			{
				href: routes.stripePayment.productList,
				name: "Products",
				Icon: <BsBoxSeam />,
			},
			{
				href: routes.stripePayment.transactions,
				name: "Transactions",
				Icon: <MdPayments />,
			},
			{
				href: routes.stripePayment.coupons.list,
				name: "Coupons",
				Icon: <Package2Icon />,
			},
		],
	},
	{
		href: routes.chat,
		name: "Chat",
		Icon: <PiChatTeardropText />,
	},
	{
		href: routes.settings.profile,
		name: "Settings",
		Icon: <AiOutlineSetting />,
	},
	{
		href: routes.queries,
		name: "Queries",
		Icon: <RxDashboard />,
	},
	{
		href: routes.cards.list,
		name: "Cards",
		Icon: <TbReceiptDollar />,
	},
	{
		href: "/client/user-details",
		name: "User Details",
		Icon: <UserCog />,
		hidden: true,
	},
	{
		href: routes.stripePayment.coupons.create,
		name: "Create Coupon",
		Icon: <Package2Icon />,
		hidden: true,
	},
];
