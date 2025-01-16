import { writable } from "svelte/store";
import type { Player } from "@/types/matchup";

interface MatchupState {
  selectedTeam: {
    challenger: number;
    opponent: number;
  };
  selectingFor: 'challenger' | 'opponent';
  selectedPlayers: {
    challenger: Player[];
    opponent: Player[];
  };
  filters: {
    season: string;
    position: string;
  };
  searchQuery: string;
}

const initialState: MatchupState = {
  selectedTeam: {
    challenger: 114,
    opponent: 144
  },
  selectingFor: 'challenger',
  selectedPlayers: {
    challenger: [],
    opponent: []
  },
  filters: {
    season: '2024',
    position: 'P'
  },
  searchQuery: ''
};

export const matchupStore = writable<MatchupState>(initialState);
