import { createContext, ReactNode, useContext, useState } from "react";

type TeamModeContextType = {
    isTeamMode: boolean;
    setIsTeamMode: (value: boolean) => void;
    toggleTeamMode: () => void;
};

const TeamModeContext = createContext<TeamModeContextType | null>(null);

export function TeamModeProvider({ children }: { children: ReactNode }) {
    const [isTeamMode, setIsTeamMode] = useState(false);

    const toggleTeamMode = () => {
    setIsTeamMode((prev) => !prev);
    };

    return (
        <TeamModeContext.Provider
        value={{
            isTeamMode,
            setIsTeamMode,
            toggleTeamMode,
        }}
        >
        {children}
        </TeamModeContext.Provider>
    );
}

export function useTeamMode() {
    const context = useContext(TeamModeContext);

    if (!context) {
        throw new Error("useTeamMode must be used within TeamModeProvider");
    }

    return context;
}