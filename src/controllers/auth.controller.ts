import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";

const authService = new AuthService();

// login function
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.login(req.body, req, res);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

// logout function
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.logout(req.params.sessionId, res);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

// refreshTokens function
export const refreshTokens = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.refreshTokens(req, res);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

// googleLogin function
export const googleLogin = async (req: Request, res: Response): Promise<void> =>  {
  const { token } = req.body || {};
  if (!token) {
    res.status(400).json({ success: false, message: "Missing token" });
    return;
  }

 try{
  const user = await authService.verifyGoogleToken(token);
   res.json({
    success:true,
    message: "Google login successful",
    user,
  });
  return;
 } catch (error: any) {
    res.status(error.status || 500).json({
     success: false,
     message: error.message || "Internal server error",
   });
   return;
 }
}

