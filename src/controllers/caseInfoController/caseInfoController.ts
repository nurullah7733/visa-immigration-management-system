import supabase from "../../utils/supabase/supabaseClient.js";

//  get a user caseInfo Information
export const getCaseInfoController = async (req: any, res: any) => {
  const userId = req.params.userId;

  try {
    const { data, error } = await supabase
      .from("case_info")
      .select("*")
      .eq("user_id", userId);

    if (error == null) {
      return res.status(200).json({
        status: "success",
        data: data,
      });
    } else {
      return res.status(400).json({ status: "fail", data: error?.message });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: "fail", data: error });
  }
};

//  get all users caseInfo Information
export const getAllCaseInfoController = async (req: any, res: any) => {
  try {
    const { data, error } = await supabase.from("case_info").select(`
      *,
      users (
      id,
      name, 
      email, 
      first_name,
      last_name,
      full_name,
      avatar_url,
      created_at
      )
    `);

    if (error == null) {
      return res.status(200).json({
        status: "success",
        data: data,
      });
    } else {
      return res.status(400).json({ status: "fail", data: error?.message });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: "fail", data: error });
  }
};

// create caseInfo
export const createOrUpdateCaseInfoController = async (req: any, res: any) => {
  const {
    user_id,
    case_owner_name,
    case_owner_user_id,
    case_owner_email,
    case_type,
    case_subtype,
    current_status,
    priority,
    notes,
    filing_type,
    filing_deadline,
    estimated_completion_date,
  } = req.body;

  try {
    const { data, error } = await supabase
      .from("case_info")
      .upsert(
        [
          {
            user_id,
            case_owner_name,
            case_owner_user_id,
            case_owner_email,
            case_type,
            case_subtype,
            current_status,
            priority,
            filing_type,
            notes,
            filing_deadline,
            estimated_completion_date,
          },
        ],
        { onConflict: "user_id" }
      )
      .select();

    if (error == null) {
      return res.status(200).json({ status: "success", data: data });
    } else {
      return res.status(400).json({ status: "fail", data: error?.message });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: "fail", data: error });
  }
};
