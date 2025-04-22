import supabase from "../../utils/supabase/supabaseClient.js";

//  get  personal Information
export const getPersonalInformationController = async (req: any, res: any) => {
  const userId = req.params.userId;

  try {
    const { data, error } = await supabase
      .from("personal_information")
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

// create personal Information
export const createOrUpdatePersonalInformationController = async (
  req: any,
  res: any
) => {
  const {
    user_id,
    first_name,
    middle_name,
    last_name,
    used_other_names,
    date_of_birth,
    gender,
    country_of_birth,
    province_of_birth,
    country_of_citizenship,
    currently_in_us,
    applied_for_us_visa,
    alien_registration_number,
    social_security_number,
    been_to_us,
    passport_number,
    passport_issuing_country,
    passport_issued_date,
    passport_expiry_date,
    has_us_address,
    us_address,
    us_address_apt,
    us_unit_type,
    us_city,
    us_state,
    us_zip_code,
    foreign_address,
    foreign_apt,
    foreign_unit_type,
    foreign_city,
    foreign_state_province,
    foreign_postal_code,
    foreign_country,
    foreign_province,
    phone_number,
    email,
  } = req.body;

  try {
    const { data, error } = await supabase
      .from("personal_information")
      .upsert(
        [
          {
            user_id,
            first_name,
            middle_name,
            last_name,
            used_other_names,
            date_of_birth,
            gender,
            country_of_birth,
            province_of_birth,
            country_of_citizenship,
            currently_in_us,
            applied_for_us_visa,
            alien_registration_number,
            social_security_number,
            been_to_us,
            passport_number,
            passport_issuing_country,
            passport_issued_date,
            passport_expiry_date,
            has_us_address,
            us_address,
            us_address_apt,
            us_unit_type,
            us_city,
            us_state,
            us_zip_code,
            foreign_address,
            foreign_apt,
            foreign_unit_type,
            foreign_city,
            foreign_state_province,
            foreign_postal_code,
            foreign_country,
            foreign_province,
            phone_number,
            email,
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
