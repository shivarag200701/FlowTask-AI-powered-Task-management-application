import express from "express";
import {
  generateGoogleOAuthUrl,
  getGoogleTokens,
  refreshGoogleTokens,
} from "../../services/oauth/googleOAuth.js";
import {
  setState,
  getState,
  deleteState,
  type StateData,
} from "../../services/oauth/stateStore.js";
import prisma from "../../db/index.js";
import crypto from "crypto";
import { requireLogin } from "../../middleware.js";

const oauthRouter = express.Router();

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).replace(/\/$/, "");

oauthRouter.get("/google/connect", async (req, res) => {
  try {
    const state = crypto.randomBytes(32).toString("hex");
    const userId = req.session.userId;
    // for now, we are only supporting login
    // const type: 'login' | 'connect' = userId ? 'connect' : 'login';
    const type = "login";

    const stateData: StateData = {
      type,
      ...(userId !== undefined && { userId }),
      timestamp: Date.now(),
    };

    await setState(state, stateData);

    const authUrl = generateGoogleOAuthUrl(state);

    res.json({
      authUrl,
      state,
    });
  } catch (error) {
    console.error("Error initializing google oauth:", error);
    return res.status(500).json({ msg: "Failed to initialize google oauth" });
  }
});

oauthRouter.get("/google/callback", async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error("Google OAuth error:", error);
    return res.redirect(`${FRONTEND_URL}/signin?error=${error}`);
  }
  if (!code || typeof code !== "string") {
    return res.redirect(`${FRONTEND_URL}/signin?error=missing_code`);
  }

  if (!state || typeof state !== "string") {
    return res.redirect(`${FRONTEND_URL}/signin?error=invalid_state`);
  }

  try {
    const stateData = await getState(state);
    if (!stateData) {
      return res.redirect(`${FRONTEND_URL}/signin?error=expired_state`);
    }

    await deleteState(state);

    //exchange code for tokens
    const { accessToken, refreshToken, expiresAt, userInfo } =
      await getGoogleTokens(code as string);

    if (stateData.type === "login") {
      //user already exists
      let user = await prisma.user.findUnique({
        where: {
          email: userInfo.email,
        },
      });
      if (user) {
        const currentUser = user;

        //atmomic transaction for updating user and OAuth account
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: {
              email: userInfo.email,
            },
            data: {
              image: userInfo.pictureUrl,
              emailVerified: new Date(),
            },
          });

          await tx.oAuthAccount.upsert({
            where: {
              userId_provider: {
                userId: currentUser.id,
                provider: "google",
              },
            },
            update: {
              accessToken,
              refreshToken,
              tokenExpiresAt: expiresAt,
              providerAccountId: userInfo.id,
              updatedAt: new Date(),
              pictureUrl: userInfo.pictureUrl,
            },
            create: {
              userId: currentUser.id,
              provider: "google",
              providerAccountId: userInfo.id,
              accessToken,
              refreshToken,
              tokenExpiresAt: expiresAt,
              scope: "email profile",
              pictureUrl: userInfo.pictureUrl,
            },
          });
        });

        req.session.userId = currentUser.id;
        req.session.email = currentUser.email;

        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ msg: "Session error" });
          }

          return res.redirect(`${FRONTEND_URL}/onboarding/welcome`);
        });
      }

      if (!user) {
        // create new user from google info

        //transaction for adding user and OAuth account
        const newUser = await prisma.$transaction(async (tx) => {
          const created = await tx.user.create({
            data: {
              email: userInfo.email,
              name: userInfo.name,
              hashedPassword: null,
              image: userInfo.pictureUrl,
              emailVerified: new Date(),
              preference: {
                create: {},
              },
            },
          });

          await tx.oAuthAccount.upsert({
            where: {
              userId_provider: {
                userId: created.id,
                provider: "google",
              },
            },
            update: {
              accessToken,
              refreshToken,
              tokenExpiresAt: expiresAt,
              providerAccountId: userInfo.id,
              updatedAt: new Date(),
            },
            create: {
              userId: created.id,
              provider: "google",
              providerAccountId: userInfo.id,
              accessToken,
              refreshToken,
              tokenExpiresAt: expiresAt,
              scope: "email profile",
              pictureUrl: userInfo.pictureUrl,
            },
          });
          return created;
        });

        req.session.userId = newUser.id;
        req.session.email = newUser.email;

        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ msg: "Session error" });
          }

          return res.redirect(`${FRONTEND_URL}/onboarding/welcome`);
        });
      }
    } else if (stateData.type === "connect" && stateData.userId) {
      //calender

      const userId = stateData.userId;

      // Verify session matches state (extra security check)
      if (req.session.userId !== userId) {
        return res.redirect(`${FRONTEND_URL}/settings?error=session_mismatch`);
      }

      // Create or update OAuth account for calendar integration
      await prisma.oAuthAccount.upsert({
        where: {
          userId_provider: {
            userId,
            provider: "google",
          },
        },
        update: {
          accessToken,
          refreshToken,
          tokenExpiresAt: expiresAt,
          providerAccountId: userInfo.id,
          updatedAt: new Date(),
        },
        create: {
          userId,
          provider: "google",
          providerAccountId: userInfo.id,
          accessToken,
          refreshToken,
          tokenExpiresAt: expiresAt,
          scope: "email profile",
          pictureUrl: userInfo.pictureUrl,
        },
      });
      return res.redirect(
        `${FRONTEND_URL}/settings?success=google_calendar_connected`
      );
    } else {
      return res.redirect(`${FRONTEND_URL}/signin?error=invalid_state`);
    }
  } catch (error) {
    console.error("Error processing google oauth callback:", error);
    return res.redirect(`${FRONTEND_URL}/signin?error=oauth_failed`);
  }
});

oauthRouter.get("/accounts", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  try {
    const accounts = await prisma.oAuthAccount.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        tokenExpiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res
      .status(200)
      .json({ msg: "Accounts fetched successfully", accounts });
  } catch (error) {
    console.error("Error fetching oauth accounts:", error);
    return res.status(500).json({ msg: "Failed to fetch oauth accounts" });
  }
});

oauthRouter.delete("/accounts/:id", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  if (!req.params.id) {
    return res.status(400).json({ msg: "Account id is required" });
  }

  const idParam = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
  if (!idParam) {
    return res.status(400).json({ msg: "Account id is required" });
  }

  const accountId = idParam;

  try {
    const account = await prisma.oAuthAccount.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });
    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }

    await prisma.oAuthAccount.delete({
      where: { id: accountId },
    });
    return res.status(200).json({ msg: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting oauth account:", error);
    return res.status(500).json({ msg: "Failed to delete oauth account" });
  }
});

oauthRouter.post("/google/refresh", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  try {
    const account = await prisma.oAuthAccount.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: "google",
        },
      },
    });
    if (!account || !account.refreshToken) {
      return res
        .status(404)
        .json({ msg: "No google account found or refresh token is missing" });
    }

    const { accessToken, expiresAt } = await refreshGoogleTokens(
      account.refreshToken
    );
    if (!accessToken) {
      return res.status(500).json({ msg: "Failed to refresh access token" });
    }

    await prisma.oAuthAccount.update({
      where: { id: account.id },
      data: { accessToken, tokenExpiresAt: expiresAt, updatedAt: new Date() },
    });

    return res.status(200).json({ msg: "Access token refreshed successfully" });
  } catch (error) {
    console.error("Error refreshing google access token:", error);
    return res.status(500).json({ msg: "Failed to refresh access token" });
  }
});

export default oauthRouter;
