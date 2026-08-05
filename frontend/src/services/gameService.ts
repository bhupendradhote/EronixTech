/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable preserve-caught-error */
import api from "./api";

export interface GameData {
  id?: number;
  name: string;
  genre: string;
  image_url: string;
  description?: string;
  platform?: string;
  is_active?: boolean;
}

const gameService = {
  // Public – get active games
  getActiveGames: async () => {
    const response = await api.get("/available-games");
    return response.data;
  },

  // Admin – get all games (including inactive)
  getAllGames: async () => {
    const response = await api.get("/available-games/admin");
    return response.data;
  },

  // Admin – get single game by ID
  getGameById: async (id: number) => {
    const response = await api.get(`/available-games/admin/${id}`);
    return response.data;
  },

  // Admin – create game
  createGame: async (gameData: GameData) => {
    try {
      const response = await api.post("/available-games/admin", gameData);
      return response.data;
    } catch (error: any) {
      // Extract error message from backend
      const message = error.response?.data?.message || error.message || "Create failed";
      throw new Error(message);
    }
  },

  // Admin – update game
  updateGame: async (id: number, gameData: GameData) => {
    try {
      const response = await api.put(`/available-games/admin/${id}`, gameData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Update failed";
      throw new Error(message);
    }
  },

  // Admin – soft delete (deactivate)
  deleteGame: async (id: number) => {
    try {
      const response = await api.delete(`/available-games/admin/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Delete failed";
      throw new Error(message);
    }
  },
};

export default gameService;