import express from "express";
import { z } from "zod";
const userRouter = express();
import prisma from "../db/index.js";
import dotenv from "dotenv";
import {
  signUpSchema,
  signInSchema,
  changePasswordSchema,
  ChangeNameSchema,
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
import { NODE_ENV, redisClient } from "../index.js";
import {
  getOnboardingProgress,
  setOnboardingProgress,
} from "../utils/onboarding-step-cache.js";
import multer from "multer";
import { nanoid } from "nanoid";
import { S3 } from "../services/s3/index.js";
import { getOTPRateLimiter } from "../services/rate-limiter/index.js";

dotenv.config();

const CDN_URL = process.env.CDN_URL;
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    const fileTypes = ["image/jpeg", "image/png"];

    callback(null, fileTypes.includes(file.mimetype));
  },
});

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
    await prisma.emailVerificationToken.create({
      data: {
        identifier: email,
        token: code,
        expires: new Date(Date.now() + EMAIL_OTP_EXPIRY_IN * 1000),
      },
    });

    res.status(200).json({
      msg: "OTP sent successfully",
    });

    sendEmail({ email, code, template: "verify" }).catch((err) => {
      console.error("Backgorund email send failed:", err);
    });
  } catch (error) {
    console.error("error while creating OTP", error);
    return res.status(400).json({
      msg: "OTP could not be generated",
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

  const result = await getOTPRateLimiter().get(email);

  if (result !== null && result.remainingPoints <= 0) {
    return res.status(429).json({
      msg: "Too many failed attempts. You have to try again later.",
    });
  }

  try {
    const validToken = await prisma.emailVerificationToken.findUnique({
      where: {
        identifier: email,
        token: code,
      },
    });

    if (!validToken) {
      //consume a point
      await getOTPRateLimiter().consume(email);

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

    return res.status(200).json({
      msg: "accout created sucessfully",
    });
  } catch (error) {
    console.error("error while verifying code or creating user:", error);
    res.status(500).json({
      msg: "Could not verify the code or creating user",
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
    // set userId and email in session
    req.session.userId = user.id;
    req.session.email = user.email;

    return res.status(200).json({
      msg: "Logged in successfully",
    });
  } catch (error) {
    console.error("error while signing in", error);
    return res.status(400).json({
      msg: "error while sigining in",
    });
  }
});

userRouter.post("/logout", requireLogin, async (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ msg: "Failed to logout" });
      }

      res.clearCookie("connect.sid", {
        domain: NODE_ENV === "production" ? ".shiva-raghav.com" : undefined,
        path: "/",
      });

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
      msg: "error updating password",
    });
  }
});

//todo- Have a put endpoint in user to change specific user data , instead of one for all user fields
userRouter.put("/name", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "Unauthorized",
    });
  }
  const { data, success, error } = ChangeNameSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      msg: error.issues[0]?.message,
      error: error.issues,
    });
  }
  const { name: newName } = data;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: newName,
      },
    });
    return res.status(200).json({
      msg: `Name updated sucessfully to ${updatedUser.name}`,
    });
  } catch (error) {
    console.error("error updating name", error);
    return res.status(400).json({
      msg: "error updating name",
    });
  }
});

userRouter.post("/onboarding/progess", requireLogin, async (req, res) => {
  const userId = req.session.userId;
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
  const userId = req.session.userId;
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
    step: step,
  });
});

//todo- change name to preferences
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

//todo- change name to preferences

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

userRouter.post(
  "/profile",
  requireLogin,
  upload.single("image"),
  async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        msg: "Not authorized",
      });
    }
    const schema = z.object({
      name: z.string(),
    });

    const { data, success, error } = schema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({
        msg: error.issues[0]?.message,
        error: error.issues,
      });
    }

    const { name } = data;

    const file = req.file;
    try {
      let imageURL: string | undefined;
      if (file) {
        const key = `avatars/${userId}_${nanoid(7)}`;

        await S3.upload({
          key: key,
          body: file.buffer,
          contentType: file.mimetype,
        });

        //todo add cdn url infront after setting up cloud front
        imageURL = `${CDN_URL}${key}`;
      }

      console.log("image URL", imageURL);
      // store the db first - think about whether we can use update here
      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
          ...(imageURL && { image: imageURL }),
        },
      });

      return res.status(201).json({
        msg: "user profile updated successfully",
      });
    } catch (error) {
      console.error(`error while updaing user profile`, error);
      res.status(502).json({
        msg: "error while updating user profile",
      });
    }
  },
);

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
        name: true,
        email: true,
        image: true,
        isPasswordSet: true,
        createdAt: true,
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
        name: user.name,
        email: user.email,
        isPasswordSet: user.isPasswordSet,
        image: user.image,
        provider: user.oauthAccounts?.[0]?.provider || null,
        isOAuthLinked: user.oauthAccounts?.length > 0,
        createdAt: user.createdAt,
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
