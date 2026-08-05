    import api from "./api";
    import type { RegisterData } from "../types/auth";

    const GAME_TOKEN_KEY = "gameToken";

    const setGameSession = (token: string | null) => {
      if (token) {
        localStorage.setItem(GAME_TOKEN_KEY, token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        localStorage.removeItem(GAME_TOKEN_KEY);
        delete api.defaults.headers.common["Authorization"];
      }
    };

    export const restoreGameToken = () => {
      const token = localStorage.getItem(GAME_TOKEN_KEY);
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      return token;
    };

    const gameAuthService = {
      register: async (userData: RegisterData & { username: string }) => {
        const response = await api.post("/game/auth/register", userData);
        if (response.data.token) setGameSession(response.data.token);
        return response.data;
      },

      login: async (credentials: { identifier: string; password: string }) => {
        const response = await api.post("/game/auth/login", credentials);
        if (response.data.token) setGameSession(response.data.token);
        return response.data;
      },

      googleLogin: async (googleToken: string) => {
        const response = await api.post("/game/auth/google", { token: googleToken });
        if (response.data.token) setGameSession(response.data.token);
        return response.data;
      },

      getProfile: async () => {
        const token = localStorage.getItem(GAME_TOKEN_KEY);
        if (token) setGameSession(token);
        const response = await api.get("/game/auth/profile");
        return response.data;
      },

      logout: () => setGameSession(null),
    };

    export default gameAuthService;