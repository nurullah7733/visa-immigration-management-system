import crypto from "crypto";
import supabase from "../../utils/supabase/supabaseClient.js";
import resendMail from "../../utils/resend/resendMail.js";

// send invite controller
export const sendInviteController = async (req: any, res: any) => {
  const {
    email,
    case_type,
    case_subtype,
    case_owner_name,
    case_owner_user_id,
    case_owner_email,
    current_status,
    priority,
    filing_type,
    notes,
    filing_deadline,
    estimated_completion_date,
  } = req.body;
  const token = crypto.randomBytes(12).toString("hex");
  const inviteLink = `${process.env.FRONTEND_URL}/invite?token=${token}`;

  try {
    const inviteResult = await supabase.from("invites").upsert(
      {
        email,
        token,
        status: "pending",
        case_type,
        case_subtype,
        case_owner_name,
        case_owner_user_id,
        case_owner_email,
        current_status,
        priority,
        notes,
        filing_type,
        filing_deadline,
        estimated_completion_date,
      },
      { onConflict: "email" }
    );

    const emailHtml = `
      <p>Hey there!</p>
      <p>You've been invited to join our Visa Immigration App. Click below to sign up:</p>
      <a href="${inviteLink}">Accept Invite</a>
    `;

    const resendMailResult = await resendMail(
      email,
      "You're Invited 🎉",
      emailHtml
    );

    if (resendMailResult.error || inviteResult.error) {
      if (resendMailResult.error) {
        console.log(resendMailResult);
        return res
          .status(400)
          .json({ status: "fail", data: { resendMailResult } });
      }

      if (inviteResult.error) {
        return res.status(400).json({ status: "fail", data: { inviteResult } });
      }
    }

    return res.status(200).json({
      status: "success",
      data: "Invite sent successfully",
      inviteResult,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ data: "Something went wrong" });
  }
};

// verify invite controller check emailToken == database inviteToken
export const verifiyInviteController = async (req: any, res: any) => {
  const { token } = req.query;

  try {
    const { data, error } = await supabase
      .from("invites")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (error || !data) {
      return res.status(400).json({ status: "fail", data: { valid: false } });
    }

    return res.status(200).json({
      status: "success",
      data: { email: data.email, valid: true },
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ data: "Something went wrong" });
  }
};

// complete invite controller check token and (inviteEmail == userEmail) and then update invite status to accepted
export const completeInviteController = async (req: any, res: any) => {
  const { token, userEmail } = req.body;

  try {
    const { data: invite } = await supabase
      .from("invites")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (!invite || invite.email !== userEmail) {
      return res
        .status(400)
        .json({ status: "fail", data: "Invite token or email mismatch" });
    }

    // invite status update
    await supabase
      .from("invites")
      .update({ status: "accepted" })
      .eq("id", invite.id);

    return res.status(200).json({ status: "success", data: "Invite accepted" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ data: "User complete Something went wrong" });
  }
};
