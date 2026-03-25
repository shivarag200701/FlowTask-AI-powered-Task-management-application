import { Resend } from "resend";
import dotenv from "dotenv";
import { render, pretty } from "@react-email/render";
import NotificationEmail from "./templates/NotificationEmail.js";
import VerifyEmail from "./templates/VerifyEmail.js";

dotenv.config();

//instantitate the resend
if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing required environment variable: RESEND_API_KEY");
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface BaseEmailProps {
  email: string;
}

interface NotificationEmailProps extends BaseEmailProps {
  template: "notification";
  todoId: string;
  title: string;
}

interface OtpEmailProps extends BaseEmailProps {
  template: "verify";
  code: string;
}

type sendEmailProps = NotificationEmailProps | OtpEmailProps;

export async function sendEmail(props: sendEmailProps) {
  if (!process.env.EMAIL) {
    throw new Error("Missing required environment variable: EMAIL");
  }
  const from =
    process.env.NODE_ENV === "development"
      ? "Acme <onboarding@resend.dev>"
      : process.env.EMAIL;
  try {
    let html: string;
    let subject: string;

    switch (props.template) {
      case "notification":
        html = await pretty(
          await render(
            <NotificationEmail title={props.title} todoId={props.todoId} />,
          ),
        );
        subject = "Reminder from FlowTask about Task";
        break;

      case "verify":
        html = await pretty(await render(<VerifyEmail code={props.code} />));
        subject = "FlowTask: OTP to verify your account";
        break;
    }

    const { data } = await resend.emails.send({
      from,
      to: props.email,
      subject,
      html,
    });
    return data;
  } catch (error) {
    console.error("Failed to send email", error);
    throw error;
  }
}
