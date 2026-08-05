import api from './api';

export interface Player {
    id: number;
    username: string;
    email: string;
    full_name: string;
    phone_number?: string;
    is_active: boolean;
    coins: number;
    level: number;
    last_login?: string;
    created_at: string;
    updated_at?: string;
}

export interface PlayersResponse {
    success: boolean;
    data: Player[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PlayerResponse {
    success: boolean;
    player: Player;
}

const playersService = {
    getPlayers: async (filters: {
        search?: string;
        is_active?: string | number;
        page?: number;
        limit?: number;
    } = {}): Promise<PlayersResponse> => {
        const res = await api.get('/players', { params: filters });
        return res.data;
    },

    getPlayerById: async (id: number): Promise<PlayerResponse> => {
        const res = await api.get(`/players/${id}`);
        return res.data;
    },

    updatePlayer: async (id: number, data: Partial<Player>): Promise<PlayerResponse> => {
        const res = await api.put(`/players/${id}`, data);
        return res.data;
    },

    togglePlayerStatus: async (id: number): Promise<{ success: boolean; message: string; is_active: boolean }> => {
        const res = await api.patch(`/players/${id}/toggle`);
        return res.data;
    }
};

export default playersService;