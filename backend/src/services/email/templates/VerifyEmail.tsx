interface VerifyEmail {
  code: string;
}
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export default function VerifyEmail({ code = "123456" }: { code: string }) {
  return (
    <Html>
      <Head />
      <Preview>Your FlowTask Verification Code</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded border border-solid border-neutral-200 px-10 py-5">
            <Section className="w-full mx-auto">
              <Row className="table-cell h-[44px] w-full mx-auto align-bottom">
                <Column className="w-full mx-auto">
                  <Img
                    alt="FlowTask"
                    width={50}
                    height={50}
                    src="https://flowtask-static.s3.us-east-2.amazonaws.com/flowtask-logo.png"
                    className="w-full mx-auto"
                  />
                </Column>
                <Column className="w-full mx-auto">
                  <Text className="text-lg font-semibold">FlowTask</Text>
                </Column>
              </Row>
            </Section>
            <Heading className="mx-0 my-7 p-0 text-xl font-medium text-black">
              Please confirm your email address
            </Heading>
            <Text className="mx-auto text-sm leading-6">
              Enter this code on the FlowTask verify page to complete your sign
              up:
            </Text>
            <Section className="my-8 rounded-lg border border-solid border-neutral-200">
              <div className="mx-auto w-fit px-6 py-3 text-center font-mono text-2xl font-semibold tracking-[0.25em]">
                {code}
              </div>
            </Section>
            <Text className="text-sm leading-6 text-black">
              This code expires in 5 minutes.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
