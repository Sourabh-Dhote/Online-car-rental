import axios from "axios";
import BASE_URL from "./api"; // BASE_URL = "http://localhost:5001/api"

// ✅ FIX 3: BASE_URL already includes /api — don't add it again!
// Was: axios.post(`${BASE_URL}/api/auth/register`, ...) → http://localhost:5001/api/api/auth/register ❌
// Now: axios.post(`${BASE_URL}/auth/register`, ...)      → http://localhost:5001/api/auth/register     ✅

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  const res = await axios.post(`${BASE_URL}/auth/register`, data);
  return res.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const res = await axios.post(`${BASE_URL}/auth/login`, data);
  return res.data;
};