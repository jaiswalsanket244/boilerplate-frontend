import { type FormFieldConfig } from "@/components/common/form/types";
import { type ContactFormData, USER_QUERY_SUBJECT } from "@/module/profile/types";

export const MESSAGE_CHAR_LIMIT = 100;

const firstNameConfig: FormFieldConfig<ContactFormData> = {
	fieldVariant: "input",
	name: "name.first",
	placeholder: "John",
	label: "First Name",
	className: "bg-card text-card-foreground",
};

const lastNameConfig: FormFieldConfig<ContactFormData> = {
	fieldVariant: "input",
	name: "name.last",
	placeholder: "Doe",
	label: "Last Name",
	className: "bg-card text-card-foreground",
};

const emailConfig: FormFieldConfig<ContactFormData> = {
	fieldVariant: "input",
	name: "email",
	label: "Email",
	className: "bg-card text-card-foreground",
	placeholder: "john@example.com",
};

const subjectConfig: FormFieldConfig<ContactFormData> = {
	name: "subject",
	label: "Select Subject",
	fieldVariant: "radio-group",
	options: Object.values(USER_QUERY_SUBJECT).map((subject) => ({
		label: subject,
		value: subject,
	})),
};

const messageConfig = (
	handlePaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
): FormFieldConfig<ContactFormData> => ({
	fieldVariant: "textarea",
	name: "message",
	label: "Message",
	className: "resize-none border bg-card text-card-foreground",
	placeholder: "Type your message here",
	showCharCount: true,
	textareaProps: {
		maxLength: MESSAGE_CHAR_LIMIT,
		onPaste: handlePaste,
		rows: 3,
	},
});

export const contactFormFieldConfigs = {
	firstName: firstNameConfig,
	lastName: lastNameConfig,
	email: emailConfig,
	subject: subjectConfig,
	message: messageConfig,
};
