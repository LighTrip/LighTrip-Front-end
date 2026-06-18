import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import * as SecureStore from 'expo-secure-store';

type TeamModeContextType = {
    isTeamMode: boolean;
    teamId: string | null;
    teamName: string | null;
    setIsTeamMode: (value: boolean) => void;
    toggleTeamMode: () => Promise<void>;
};

const TeamModeContext = createContext<TeamModeContextType | null>(null);

export function TeamModeProvider({ children }: { children: ReactNode }) {
    const [isTeamMode, setIsTeamMode] = useState(false);
    const [teamId, setTeamId] = useState<string | null>(null);
    const [teamName, setTeamName] = useState<string | null>(null);

    useEffect(() => {
        SecureStore.getItemAsync('teamId').then(id => setTeamId(id)).catch(() => {});
        SecureStore.getItemAsync('teamName').then(name => setTeamName(name)).catch(() => {});
    }, []);

    const toggleTeamMode = async () => {
        if (!isTeamMode) {
            const id = await SecureStore.getItemAsync('teamId').catch(() => null);
            const name = await SecureStore.getItemAsync('teamName').catch(() => null);
            setTeamId(id);
            setTeamName(name);
        }
        setIsTeamMode(prev => !prev);
    };

    return (
        <TeamModeContext.Provider
        value={{
            isTeamMode,
            teamId,
            teamName,
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