import express from "express";
import { z } from "zod";
const userRouter = express();
import prisma from "../db/index.js";
import dotenv from "dotenv";
import {
  signUpSchema,
  signInSchema,
  changePasswordSchema,
  ChangeUsernameSchema,
  changePreferencesSchema,
  emailSchema,
  passwordSchema,
  setOnboardingProgressSchema,
} from "@shiva200701/todotypes";
import crypto from "crypto";
import { hashPassword, verifyPassword } from "../utils/auth/passwordHasher.js";
import { requireLogin } from "../middleware.js";
import generateOTP from "../utils/auth/otpGenerator.js";
import { EMAIL_OTP_EXPIRY_IN } from "../utils/auth/constants.js";
import { sendEmail } from "../services/email/EmailService.js";
import { redisClient } from "../index.js";
import {
  getOnboardingProgress,
  setOnboardingProgress,
} from "../utils/onboarding-step-cache.js";

dotenv.config();

userRouter.use(express.json());

userRouter.post("/signup/send-otp", async (req, res) => {
  const schema = z.object({
    email: emailSchema,
    password: passwordSchema.optional(),
  });
  const { data, success, error } = schema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: error.issues[0]?.message,
      errors: error.issues,
    });
  }

  const { email } = data;
  try {
    const isExistingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (isExistingUser) {
      return res.status(400).json({
        msg: "User already exists. Please login instead of requesting a new OTP.",
      });
    }

    const code = generateOTP();

    // delete token if already exists for user
    await prisma.emailVerificationToken.deleteMany({
      where: {
        identifier: email,
      },
    });

    //insert into db and send email
    (await prisma.emailVerificationToken.create({
      data: {
        identifier: email,
        token: code,
        expires: new Date(Date.now() + EMAIL_OTP_EXPIRY_IN * 1000),
      },
    }),
      res.status(200).json({
        msg: "OTP sent successfully",
      }));

    sendEmail({ email, code, template: "verify" }).catch((err) => {
      console.error("Backgorund email send failed:", err);
    });
  } catch (error) {
    console.error("error while creating OTP", error);
    return res.status(400).json({
      msg: error,
    });
  }
});

userRouter.post("/signup/verify", async (req, res) => {
  const schema = z.object({
    email: emailSchema,
    password: passwordSchema,
    code: z.string().min(6, "code is 6 characters long"),
  });

  const { data, success, error } = schema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: error.issues[0]?.message,
      errors: error.issues,
    });
  }

  const { email, password, code } = data;

  try {
    const validToken = await prisma.emailVerificationToken.findUnique({
      where: {
        identifier: email,
        token: code,
      },
    });

    if (!validToken) {
      return res.status(400).json({
        msg: "Invalid verification token entered",
      });
    }

    if (validToken.expires && validToken.expires < new Date()) {
      await prisma.emailVerificationToken.deleteMany({
        where: {
          identifier: email,
          token: code,
        },
      });
      return res.status(400).json({
        msg: "Verification code has expired. Please request a new one.",
      });
    }

    const { hashedPassword } = await hashPassword(password);

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        msg: "User already exists, Try to signin",
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        isPasswordSet: true,
        emailVerified: new Date(),
        preference: {
          create: {},
        },
      },
    });

    // Normal flow - just set userId and save
    req.session.userId = user.id;
    req.session.email = user.email;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ msg: "Session error" });
      }

      // Manually set cookie since express-session isn't doing it
      const secret = process.env.SESSION_SECRET || "";

      // Sign the session ID (express-session format)
      const signature = crypto
        .createHmac("sha256", secret)
        .update(req.sessionID)
        .digest("base64")
        .replace(/=+$/, "");

      const signedId = `s:${req.sessionID}.${signature}`;

      // Build cookie string
      const cookieParts = [
        `connect.sid=${encodeURIComponent(signedId)}`,
        `Path=/`,
        `HttpOnly`,
        `Max-Age=86400`, // 24 hours
      ];

      // Add production-specific attributes
      if (process.env.NODE_ENV === "production") {
        cookieParts.push(`Secure`);
        cookieParts.push(`Domain=.shiva-raghav.com`);
      }

      cookieParts.push(`SameSite=Lax`);

      res.setHeader("Set-Cookie", cookieParts.join("; "));

      return res.status(200).json({
        msg: "accout created sucessfully",
      });
    });
  } catch (error) {
    console.error("error while verifying code or creating user:", error);
    res.status(500).json({
      msg: error,
    });
  }
});

userRouter.post("/signin", async (req, res) => {
  const schema = z.object({
    email: z.email(),
    password: z.string(),
  });

  const { data, success, error } = schema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: error.issues[0]?.message,
      error: error.issues,
    });
  }

  const { email, password } = data;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({
        msg: "No account found with that email address.",
      });
    }

    //Not yet sure whether we need to verify this yet
    // if(!user.emailVerified) {
    //   return res.status(400).json({
    //     msg: "You are not verified yet",
    //   });
    // }

    if (
      !user.hashedPassword ||
      !(await verifyPassword(password, user.hashedPassword))
    ) {
      return res.status(400).json({
        msg: "Incorrect email or password.",
      });
    }
    // Normal flow - just set userId and save
    req.session.userId = user.id;
    req.session.email = user.email;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ msg: "Session error" });
      }

      // Manually set cookie since express-session isn't doing it
      const secret = process.env.SESSION_SECRET || "";

      // Sign the session ID (express-session format)
      const signature = crypto
        .createHmac("sha256", secret)
        .update(req.sessionID)
        .digest("base64")
        .replace(/=+$/, "");

      const signedId = `s:${req.sessionID}.${signature}`;

      // Build cookie string
      const cookieParts = [
        `connect.sid=${encodeURIComponent(signedId)}`,
        `Path=/`,
        `HttpOnly`,
        `Max-Age=86400`, // 24 hours
      ];

      // Add production-specific attributes
      if (process.env.NODE_ENV === "production") {
        cookieParts.push(`Secure`);
        cookieParts.push(`Domain=.shiva-raghav.com`);
      }

      cookieParts.push(`SameSite=Lax`);

      res.setHeader("Set-Cookie", cookieParts.join("; "));

      return res.status(200).json({
        msg: "Logged in successfully",
      });
    });
  } catch (error) {
    console.error("error inserting user", error);
    return res.status(400).json({
      msg: error,
    });
  }
});

userRouter.post("/logout", requireLogin, async (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ msg: "Failed to logout" });
      }

      res.clearCookie("connect.sid");

      return res.status(200).json({ msg: "Logged out successfully" });
    });
  } else {
    return res.status(401).json({
      msg: "No active session to log out from",
    });
  }
});

userRouter.put("/password", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "Unauthorized",
    });
  }
  const { data, success, error } = changePasswordSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      msg: error.issues[0]?.message,
      error: error.issues,
    });
  }
  const { currentPassword, newPassword, confirmNewPassword } = data;

  if (confirmNewPassword != newPassword) {
    return res.status(404).json({
      msg: "New passwords don't match",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        hashedPassword: true,
        isPasswordSet: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    if (!user.isPasswordSet || !user.hashedPassword) {
      return res.status(404).json({
        msg: "Password is not set",
      });
    }

    const isPasswordValid = await verifyPassword(
      currentPassword,
      user.hashedPassword,
    );

    if (!isPasswordValid) {
      return res.status(404).json({
        msg: "current password is not incorrect",
      });
    }

    const { hashedPassword: newHashedPassword } =
      await hashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedPassword: newHashedPassword,
      },
    });

    return res.status(200).json({
      msg: "Password updated sucessfully",
    });
  } catch (error) {
    console.error("error updating password", error);
    return res.status(400).json({
      msg: error,
    });
  }
});

userRouter.put("/username", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "Unauthorized",
    });
  }
  const { data, success, error } = ChangeUsernameSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      msg: error.issues[0]?.message,
      error: error.issues,
    });
  }
  const { username: newUsername } = data;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: newUsername,
      },
    });
    return res.status(200).json({
      msg: `Username updated sucessfully to ${updatedUser.username}`,
    });
  } catch (error) {
    console.error("error updating username", error);
    return res.status(400).json({
      msg: error,
    });
  }
});

userRouter.post("/onboarding/progess", requireLogin, async (req, res) => {
  const userId = req.session.id;
  if (!userId) {
    return res.status(401).json({
      msg: "Unauthorized",
    });
  }
  const { data, success, error } = setOnboardingProgressSchema.safeParse(
    req.body,
  );

  if (!success) {
    return res.status(400).json({
      msg: error.issues[0]?.message,
      error: error.issues,
    });
  }
  const { step } = data;

  await setOnboardingProgress(userId, step);

  return res.status(200).json({
    msg: "Successfully updated the onboarding step",
  });
});

userRouter.get("/onboarding/progess", requireLogin, async (req, res) => {
  const userId = req.session.id;
  if (!userId) {
    return res.status(401).json({
      msg: "Unauthorized",
    });
  }

  const step = await getOnboardingProgress(userId);

  if (!step) {
    return res.status(400).json({
      msg: "Onboarding step not found for user",
    });
  }

  return res.status(200).json({
    msg: step,
  });
});

userRouter.get("/user-preferences", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "Not authorized",
    });
  }

  try {
    const preferences = await prisma.userPrefrence.findUnique({
      where: { userId: userId },
    });

    if (!preferences) {
      return res.status(401).json({
        msg: "preferences for the user not found",
      });
    }

    return res.status(200).json(preferences);
  } catch (error) {
    console.error("Error fetching user preferences", error);
    return res.status(500).json({
      msg: "Failed to fetch user preferences",
    });
  }
});

userRouter.put("/user-preferences", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "Not authorized",
    });
  }
  const { data, success, error } = changePreferencesSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      msg: error.issues[0]?.message,
      error: error.issues,
    });
  }

  const updateData = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => value !== undefined),
  );

  if (Object.keys(updateData).length === 0) {
    return res
      .status(400)
      .json({ msg: "Send at least one preference to update" });
  }

  try {
    await prisma.userPrefrence.update({
      where: { userId },
      data: updateData,
    });

    return res.status(200).json({
      msg: "successfully updated the user preferences",
    });
  } catch (error) {
    console.error("failed to updated user preference", error);
    return res.status(500).json({
      msg: "Failed to update user preference",
    });
  }
});

userRouter.get("/profile", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "Not authorized",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        isPasswordSet: true,
        oauthAccounts: {
          where: { provider: "google" },
          select: {
            pictureUrl: true,
            provider: true,
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isPasswordSet: user.isPasswordSet,
        pictureUrl: user.oauthAccounts?.[0]?.pictureUrl || null,
        provider: user.oauthAccounts?.[0]?.provider || null,
        isOAuthLinked: user.oauthAccounts?.length > 0,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile", error);
    return res.status(500).json({
      msg: "Failed to fetch user profile",
    });
  }
});

export default userRouter;
