import type { GameType } from "@/types/games";


export const DugoutGames = [
    {
        id: "4-pic-1-word",
        title: "4 Pic 1 Word",
        description: "Identify the baseball term from four related images!",
        image: "/images/4-pic-one-word.png",
        available: true,
    },
    {
        id: "quiz",
        title: "Quiz",
        description: "Test your knowledge of baseball with this fun trivia game!",
        image: "/images/word-search.png",
        available: false,
    },
    {
        id: "word-search",
        title: "Word Search", 
        description: "Search for baseball terms and lingo hidden in the puzzle grid",
        image: "/images/word-search.png",
        available: false,
    },
] satisfies {
    id: GameType;
    title: string;
    description: string;
    image: string;
    available: boolean;
}[]