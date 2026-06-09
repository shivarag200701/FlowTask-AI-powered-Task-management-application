export default function generateOTP() {
  const OTP = Math.floor(Math.random() * 1000000);

  return OTP.toString().padStart(6, "0");
}
