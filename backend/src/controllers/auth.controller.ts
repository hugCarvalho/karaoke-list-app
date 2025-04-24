import { CREATED } from "../constants/http";
import { createAccount, CreateAccountParams } from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import { setAuthCookies } from "../utils/cookies";
import { registerSchema } from "./auth.schemas";

export const registerHandler = catchErrors(async (req, res) => {
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  })
  console.log("REQUEST", request)
  const { user, accessToken, refreshToken } = await createAccount(request as CreateAccountParams)
  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json(user)
})
