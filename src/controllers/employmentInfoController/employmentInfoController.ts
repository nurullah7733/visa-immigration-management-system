import supabase from "../../utils/supabase/supabaseClient.js";

//  get  Employment Information
export const getEmploymentInfoController = async (req: any, res: any) => {
  const userId = req.params.userId;

  try {
    const { data, error } = await supabase
      .from("employment_information")
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

// create Employment
export const createOrUpdateEmploymentInfoController = async (
  req: any,
  res: any
) => {
  const { user_id, ...meta } = req.body;

  try {
    const { data, error } = await supabase
      .from("employment_information")
      .upsert([{ user_id, meta }], { onConflict: "user_id" })
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
