import bcrypt from "bcrypt";
const saltRounds = 10;
import supabase from "../../utils/supabase/supabaseClient.js";

// create user controller
export const createUserController = async (req: any, res: any) => {
  const { fullName, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userData = await supabase
      .from("users")
      .insert({
        full_name: fullName,
        email: email,
        password: hashedPassword,
        role: "wrong_user",
      })
      .select("id, full_name, email, role")
      .single();

    if (userData?.error?.details?.includes("Key (email)")) {
      return res
        .status(400)
        .json({ status: "fail", data: "Email already exists" });
    } else if (userData?.error) {
      return res
        .status(400)
        .json({ status: "fail", data: "Something went wrong" });
    }
    return res.status(200).json({
      status: "success",
      data: userData,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ data: "Something went wrong" });
  }
};

// login user
export const loginUserController = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "fail", data: "Email and password are required" });
    }

    // 2. Find user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res
        .status(401)
        .json({ status: "fail", data: "Invalid email or password" });
    }

    // 3. Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ status: "fail", data: "Invalid email or password" });
    }

    //   Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      status: "success",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: "fail", data: "Something went wrong" });
  }
};
