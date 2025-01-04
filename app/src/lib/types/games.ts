

export type SavePreference = {
    teams: number[];
    players?: number[];
}

export type MLBGlossary = {
    id: string;
    title: string;
    url: string;
    definition: string;
}

export type GameType = "4-pic-1-word" | "quiz" | "word-search"
