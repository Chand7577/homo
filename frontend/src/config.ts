// Production: https://homo-backend-sumy.onrender.com/homeopathy
export const API_BASE = process.env.NODE_ENV === "production" 
  ? "https://homo-backend-sumy.onrender.com/homeopathy" 
  : "http://localhost:8000/homeopathy";
