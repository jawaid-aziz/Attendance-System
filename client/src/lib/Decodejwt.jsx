export const decodeJWT = (token) => {
    try {
      const payload = token.split(".")[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error("Failed to decode JWT token:", error);
      return null;
    }
  };
  