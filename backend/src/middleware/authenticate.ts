// @ts-nocheck
import { RequestHandler } from "express";
import AppErrorCode from "../constants/appErrorCode";
import { UNAUTHORIZED } from "../constants/http";
import appAssert from "../utils/appAssert";
import { verifyToken } from "../utils/jwt";

// wrap with catchErrors() if async needed
const authenticate: RequestHandler = (req, res, next) => {
  const accessToken = req.cookies.accessToken as string | undefined
  appAssert(
    accessToken,
    UNAUTHORIZED,
    "Not authorized",
    AppErrorCode.InvalidAccessToken
  )

  const { error, payload } = verifyToken(accessToken)
  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token",
    AppErrorCode.InvalidAccessToken
  )

  req.userId = payload.userId
  req.sessionId = payload.sessionId
  next()
}

export default authenticate
