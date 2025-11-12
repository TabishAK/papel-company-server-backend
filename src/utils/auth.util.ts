import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export const createHashPassword = async (password: string): Promise<string> => {
  const saltOrRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltOrRounds);
  return hashedPassword;
};

export const verifyPassword = async (
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainTextPassword, hashedPassword);
};

export const verifyToken = async (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
  } catch (error) {
    return undefined;
  }
};
