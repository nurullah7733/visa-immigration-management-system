import pool from "../../utils/supabase/db.js";
import adminSupabase from "../../utils/supabase/supabaseAdmin.js";
import supabase from "../../utils/supabase/supabaseClient.js";

export const updateUserEmailOrPasswordController = async (
  req: any,
  res: any
) => {
  const { userId, newEmail, newPassword } = req.body;

  try {
    // Get old email from users table
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      userId,
    ]);
    const oldEmail = result.rows[0]?.email;
    const auth_id = result.rows[0]?.auth_id;

    if (!oldEmail) {
      return res.status(404).json({ status: "fail", data: "User not found" });
    }

    if (!auth_id) {
      return res.status(400).json({
        status: "fail",
        data: "User does not have a valid auth_id linked to Supabase Auth",
      });
    }

    // Prepare update object for Supabase auth
    const updates: { email?: string; password?: string } = {};
    if (newEmail) updates.email = newEmail;
    if (newPassword) updates.password = newPassword;

    // Only update if something is provided
    if (Object.keys(updates).length > 0) {
      const { error: authError } =
        await adminSupabase.auth.admin.updateUserById(auth_id, updates);

      if (authError) {
        return res
          .status(400)
          .json({ status: "fail", data: authError.message });
      }
    }

    // Update custom users table if newEmail exists
    if (newEmail) {
      await pool.query(`UPDATE users SET email = $1 WHERE id = $2`, [
        newEmail,
        userId,
      ]);

      // Update invites table where email matched
      await pool.query(`UPDATE invites SET email = $1 WHERE email = $2`, [
        newEmail,
        oldEmail,
      ]);
    }

    return res
      .status(200)
      .json({ status: "success", data: "User updated successfully." });
  } catch (err: any) {
    return res.status(400).json({ status: "fail", data: err.message });
  }
};

export const deleteUser = async (req: any, res: any) => {
  const { userId } = req.params;

  try {
    const { data: findUser, error: findUserError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId);

    if (!findUser || findUserError) {
      return res.status(404).json({ status: "fail", data: "User not found" });
    }

    const auth_id = findUser[0]?.auth_id;

    if (!auth_id) {
      return res.status(400).json({
        status: "fail",
        data: "User does not have a valid auth_id linked to Supabase Auth",
      });
    }

    const { error } = await adminSupabase.auth.admin.deleteUser(auth_id);
    if (error) {
      return res.status(400).json({ status: "fail", data: error.message });
    }
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    await pool.query(`DELETE FROM invites WHERE email = $1`, [
      findUser[0]?.email,
    ]);
    return res.status(200).json({ status: "success", data: "User deleted!" });
  } catch (err: any) {
    return res.status(400).json({ status: "fail", data: err.message });
  }
};
