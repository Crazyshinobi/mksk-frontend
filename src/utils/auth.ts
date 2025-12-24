import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: number;
  email: string;
  exp: number;
  iat: number;
}

export const getUserFromToken = (): JwtPayload | null => {
  const token = Cookies.get('accessToken');

  if (!token) return null;

  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    return null;
  }
};
