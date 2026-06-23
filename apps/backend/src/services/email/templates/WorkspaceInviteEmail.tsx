import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface WorkspaceInviteEmailProps {
  workspaceName: string;
  senderName: string;
  senderEmail: string;
  callbackURL: string;
  recipientEmail: string;
}

export default function WorkspaceInviteEmail({
  workspaceName = "Acme",
  senderName = "Mike",
  senderEmail = "Mike@acme.com",
  callbackURL = "https://app.flowtask.com/invite-link",
  recipientEmail = "user@example.com",
}: WorkspaceInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Join {workspaceName} on FlowTask</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded border border-solid border-neutral-200 px-10 py-5">
            <Section className="mt-4">
              <Row className="table-cell h-[44px] w-[56px] align-bottom">
                <Column>
                  <Img
                    alt="FlowTask"
                    width={50}
                    height={50}
                    src="https://flowtask-static.s3.us-east-2.amazonaws.com/logo.png"
                    className="my-0"
                  />
                </Column>
                <Column>
                  <Text className="text-lg font-semibold m-0">FlowTask</Text>
                </Column>
              </Row>
            </Section>

            <Heading className="mx-0 mt-8 mb-4 p-0 text-xl font-semibold text-black">
              Join {workspaceName} on FlowTask
            </Heading>

            <Text className="text-sm leading-6 text-black">
              <strong>{senderName}</strong> (
              <Link href={`mailto:${senderEmail}`} className="text-blue-600">
                {senderEmail}
              </Link>
              ) has invited you to join the <strong>{workspaceName}</strong>{" "}
              workspace on FlowTask!
            </Text>

            <Section className="my-8">
              <Button
                className="rounded-md bg-[#284ea7] px-5 py-3 text-center text-sm font-medium text-white no-underline"
                href={callbackURL}
              >
                Join Workspace
              </Button>
            </Section>

            <Text className="text-sm leading-6 text-neutral-500">
              or copy and paste this URL into your browser:
            </Text>

            <Link href={callbackURL} className="text-sm text-blue-600">
              {callbackURL}
            </Link>

            <Hr className="mx-0 my-8 w-full border border-solid border-neutral-200" />

            <Text className="text-xs leading-5 text-neutral-400">
              This email was intended for{" "}
              <Link
                href={`mailto:${recipientEmail}`}
                className="text-neutral-400 underline"
              >
                {recipientEmail}
              </Link>
              . If you were not expecting this email, you can ignore it. If you
              are concerned about your account's safety, please reply to this
              email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
