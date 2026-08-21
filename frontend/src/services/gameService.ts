/* eslint-disable preserve-caught-error */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

export interface GameData {
  id?: number;
  name: string;
  genre: string;
  image_url: string;            // note: field name matches backend
  description?: string;
  game_device_id: number;       // now a number (foreign key)
  is_active?: boolean;
}

export interface Game {
  id: number;
  name: string;
  genre: string;
  image_url: string;
  description?: string;
  platform: string;             // device name (from join)
  game_device_id: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const gameService = {
  // Public – get active games (for the GamingZone page)
  getActiveGames: async (): Promise<{ success: boolean; games: Game[] }> => {
    const response = await api.get("/available-games");
    return response.data;
  },

  // Admin – get all games (including inactive)
  getAllGames: async (): Promise<{ success: boolean; games: Game[] }> => {
    const response = await api.get("/available-games/admin");
    return response.data;
  },

  // Admin – get single game by ID
  getGameById: async (id: number): Promise<{ success: boolean; game: Game }> => {
    const response = await api.get(`/available-games/admin/${id}`);
    return response.data;
  },

  // Admin – create game
  createGame: async (gameData: GameData): Promise<any> => {
    try {
      const response = await api.post("/available-games/admin", gameData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Create failed";
      throw new Error(message);
    }
  },

  // Admin – update game
  updateGame: async (id: number, gameData: Partial<GameData>): Promise<any> => {
    try {
      const response = await api.put(`/available-games/admin/${id}`, gameData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Update failed";
      throw new Error(message);
    }
  },

  // Admin – soft delete (deactivate)
  deleteGame: async (id: number): Promise<any> => {
    try {
      const response = await api.delete(`/available-games/admin/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Delete failed";
      throw new Error(message);
    }
  },

  // (Optional) Hard delete – if you expose the endpoint
  hardDeleteGame: async (id: number): Promise<any> => {
    try {
      const response = await api.delete(`/available-games/admin/hard/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Hard delete failed";
      throw new Error(message);
    }
  }
};

export default gameService;