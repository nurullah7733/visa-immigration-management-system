import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const resendMail = async (email: string, subject: string, html: string) => {
  const { data, error } = await resend.emails.send({
    from: "Jois <onboarding@resend.dev>",
    to: email,
    subject: subject,
    html: html,
  });

  return { data, error };
};

export default resendMail;
