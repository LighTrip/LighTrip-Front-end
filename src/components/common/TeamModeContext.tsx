import { BASE_URL } from "@/src/api/config";
import { getMyProfile, updateLiveLocationSharing } from "@/src/api/profileApi";
import { getMyTeam } from "@/src/api/teamApi";
import type { TeamLiveLocation } from "@/src/features/team/types/team.types";
import { Client, IMessage } from "@stomp/stompjs";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { AppState } from "react-native";
import SockJS from "sockjs-client";

const LIVE_LOCATION_SHARING_KEY = "liveLocationSharing";
const TEAM_MODE_ENABLED_KEY = "teamModeEnabled";
const LIVE_LOCATION_REFRESH_INTERVAL_MS = 4 * 60 * 1000;
const LIVE_LOCATION_SEND_INTERVAL_MS = 3 * 1000;
const TEAM_LOCATION_WS_URL = `${BASE_URL}/ws`;

const parseProfileUserId = (profileId: string) => {
    const parsedUserId = Number(profileId.replace("#", ""));

    return Number.isFinite(parsedUserId) ? parsedUserId : null;
};

const isInvalidTokenError = (message?: string, body?: string) =>
    [message, body].some((value) => value?.includes("유효하지 않은 토큰"));

type TeamModeContextType = {
    isTeamMode: boolean;
    teamId: string | null;
    teamName: string | null;
    isLocationSharing: boolean;
    isLocationSharingLoading: boolean;
    isTeamLocationSocketConnected: boolean;
    teamLiveLocations: TeamLiveLocation[];
    currentUserId: number | null;
    setIsTeamMode: (value: boolean) => void;
    toggleTeamMode: () => Promise<boolean>;
    setLocationSharing: (sharing: boolean) => Promise<void>;
    setTeamLiveLocations: (locations: TeamLiveLocation[]) => void;
    clearTeamMode: () => void;
};

const TeamModeContext = createContext<TeamModeContextType | null>(null);

export function TeamModeProvider({ children }: { children: ReactNode }) {
    const [isTeamMode, setIsTeamMode] = useState(false);
    const [teamId, setTeamId] = useState<string | null>(null);
    const [teamName, setTeamName] = useState<string | null>(null);
    const [isLocationSharing, setIsLocationSharing] = useState(false);
    const [isLocationSharingLoading, setIsLocationSharingLoading] =
        useState(false);
    const [
        isTeamLocationSocketConnected,
        setIsTeamLocationSocketConnected,
    ] = useState(false);
    const [teamLiveLocations, setTeamLiveLocations] = useState<
        TeamLiveLocation[]
    >([]);
    const [nickname, setNickname] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const stompClientRef = useRef<Client | null>(null);
    const isLocationSharingRef = useRef(isLocationSharing);
    const currentUserIdRef = useRef(currentUserId);

    const upsertTeamLiveLocation = (nextLocation: TeamLiveLocation) => {
        setTeamLiveLocations((currentLocations) => {
            const exists = currentLocations.some(
                (location) => location.userId === nextLocation.userId,
            );

            return exists
                ? currentLocations.map((location) =>
                    location.userId === nextLocation.userId
                        ? { ...location, ...nextLocation }
                        : location
                )
                : [...currentLocations, nextLocation];
        });
    };

    useEffect(() => {
        isLocationSharingRef.current = isLocationSharing;
    }, [isLocationSharing]);

    useEffect(() => {
        currentUserIdRef.current = currentUserId;
    }, [currentUserId]);

    useEffect(() => {
        SecureStore.getItemAsync("teamId")
            .then((id) => setTeamId(id))
            .catch(() => {});
        SecureStore.getItemAsync("teamName")
            .then((name) => setTeamName(name))
            .catch(() => {});
        SecureStore.getItemAsync(TEAM_MODE_ENABLED_KEY)
            .then((value) => setIsTeamMode(value === "true"))
            .catch(() => {});
        SecureStore.getItemAsync(LIVE_LOCATION_SHARING_KEY)
            .then((value) => setIsLocationSharing(value === "true"))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!isTeamMode || !teamId) return;

        let isMounted = true;
        let client: Client | null = null;

        const connectTeamLocationSocket = async () => {
            const accessToken = await SecureStore.getItemAsync("accessToken");

            if (!accessToken || !isMounted) return;

            client = new Client({
                webSocketFactory: () => new SockJS(TEAM_LOCATION_WS_URL),
                connectHeaders: {
                    Authorization: `Bearer ${accessToken}`,
                },
                reconnectDelay: 5000,
                onConnect: () => {
                    if (!isMounted || !client) return;

                    setIsTeamLocationSocketConnected(true);

                    client.subscribe(`/topic/team/${teamId}`, (message: IMessage) => {
                        try {
                            const nextLocation = JSON.parse(
                                message.body,
                            ) as TeamLiveLocation;

                            if (
                                !isLocationSharingRef.current &&
                                currentUserIdRef.current === nextLocation.userId
                            ) {
                                setTeamLiveLocations((currentLocations) =>
                                    currentLocations.filter(
                                        (location) =>
                                            location.userId !== nextLocation.userId,
                                    ),
                                );
                                return;
                            }

                            upsertTeamLiveLocation(nextLocation);
                        } catch {}
                    });
                },
                onStompError: (frame) => {
                    const errorMessage = frame.headers.message;
                    const errorBody = frame.body;

                    setIsTeamLocationSocketConnected(false);

                    if (isInvalidTokenError(errorMessage, errorBody)) {
                        setIsLocationSharing(false);
                        isLocationSharingRef.current = false;
                        SecureStore.setItemAsync(
                            LIVE_LOCATION_SHARING_KEY,
                            "false",
                        ).catch(() => {});
                        client?.deactivate();
                        return;
                    }

                    console.log(
                        "[TeamLocationSocket] stomp error",
                        errorMessage,
                        errorBody,
                    );
                },
                onWebSocketClose: () => {
                    setIsTeamLocationSocketConnected(false);
                },
                onWebSocketError: (event) => {
                    console.log("[TeamLocationSocket] websocket error", event);
                    setIsTeamLocationSocketConnected(false);
                },
            });

            stompClientRef.current = client;
            client.activate();
        };

        connectTeamLocationSocket();

        return () => {
            isMounted = false;
            setIsTeamLocationSocketConnected(false);
            stompClientRef.current = null;
            client?.deactivate();
        };
    }, [isTeamMode, teamId]);

    useEffect(() => {
        if (!teamId || (nickname && currentUserId !== null)) return;

        let isMounted = true;

        getMyProfile()
            .then((profile) => {
                if (!isMounted) return;

                setNickname(profile.name);
                setCurrentUserId(parseProfileUserId(profile.id));
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, [teamId, nickname, currentUserId]);

    const cacheOwnCurrentLocation = async () => {
        try {
            let ownUserId = currentUserIdRef.current;
            let ownNickname = nickname;

            if (ownUserId === null || !ownNickname) {
                const profile = await getMyProfile();
                ownUserId = parseProfileUserId(profile.id);
                ownNickname = profile.name;
                setNickname(profile.name);
                currentUserIdRef.current = ownUserId;
                setCurrentUserId(ownUserId);
            }

            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted" || ownUserId === null) return;

            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const { latitude, longitude } = currentLocation.coords;

            if (!isLocationSharingRef.current) return;

            upsertTeamLiveLocation({
                userId: ownUserId,
                nickname: ownNickname ?? "닉네임 없음",
                latitude,
                longitude,
                placeName: "현재 위치",
                passportId: 0,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.log("[TeamLocationSocket] local location cache failed", error);
        }
    };

    useEffect(() => {
        if (!isLocationSharing || !teamId || !isTeamLocationSocketConnected) {
            return;
        }

        let isActive = true;
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const sendLiveLocation = async () => {
            const client = stompClientRef.current;

            if (
                !client ||
                !client.active ||
                !client.connected ||
                !isActive ||
                !isTeamLocationSocketConnected
            ) {
                return;
            }

            try {
                const { status } =
                    await Location.requestForegroundPermissionsAsync();

                if (status !== "granted") return;

                const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                const { latitude, longitude } = currentLocation.coords;
                const payload = {
                    nickname: nickname ?? "닉네임 없음",
                    latitude,
                    longitude,
                    placeName: "현재 위치",
                };

                client.publish({
                    destination: `/app/team/${teamId}/location`,
                    body: JSON.stringify(payload),
                });

                const ownUserId = currentUserIdRef.current;

                if (ownUserId !== null) {
                    upsertTeamLiveLocation({
                        ...payload,
                        userId: ownUserId,
                        passportId: 0,
                        timestamp: new Date().toISOString(),
                    });
                }
            } catch (error) {
                console.log("[TeamLocationSocket] send failed", error);
            }
        };

        sendLiveLocation();
        intervalId = setInterval(sendLiveLocation, LIVE_LOCATION_SEND_INTERVAL_MS);

        return () => {
            isActive = false;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isLocationSharing, teamId, isTeamLocationSocketConnected, nickname]);

    useEffect(() => {
        if (!isLocationSharing || !teamId) return;

        const refreshLiveLocationSharing = async () => {
            try {
                await updateLiveLocationSharing(Number(teamId), true);
            } catch {}
        };

        refreshLiveLocationSharing();

        const intervalId = setInterval(
            refreshLiveLocationSharing,
            LIVE_LOCATION_REFRESH_INTERVAL_MS,
        );

        const subscription = AppState.addEventListener("change", (nextState) => {
            if (nextState === "active") {
                refreshLiveLocationSharing();
            }
        });

        return () => {
            clearInterval(intervalId);
            subscription.remove();
        };
    }, [isLocationSharing, teamId]);

    const setLocationSharing = async (sharing: boolean) => {
        setIsLocationSharingLoading(true);
        const previousSharing = isLocationSharingRef.current;

        try {
            isLocationSharingRef.current = sharing;
            setIsLocationSharing(sharing);

            if (sharing) {
                cacheOwnCurrentLocation();
            }

            let id =
                teamId ??
                (await SecureStore.getItemAsync("teamId").catch(() => null));

            if (!id) {
                const teamInfo = await getMyTeam();
                id = String(teamInfo.teamId);
                setTeamId(id);
                setTeamName(teamInfo.teamName);
            }

            await updateLiveLocationSharing(Number(id), sharing);
            await SecureStore.setItemAsync(
                LIVE_LOCATION_SHARING_KEY,
                String(sharing),
            );

            if (!sharing) {
                let ownUserId = currentUserId;

                if (ownUserId === null) {
                    const profile = await getMyProfile();
                    ownUserId = parseProfileUserId(profile.id);
                    setNickname(profile.name);
                    currentUserIdRef.current = ownUserId;
                    setCurrentUserId(ownUserId);
                }

                if (ownUserId !== null) {
                    setTeamLiveLocations((currentLocations) =>
                        currentLocations.filter(
                            (location) => location.userId !== ownUserId,
                        ),
                    );
                }
            }
        } catch (error) {
            isLocationSharingRef.current = previousSharing;
            setIsLocationSharing(previousSharing);
            throw error;
        } finally {
            setIsLocationSharingLoading(false);
        }
    };

    const toggleTeamMode = async () => {
        if (!isTeamMode) {
            // 캐시된 teamId 를 믿으면 안 된다. 팀에서 나갔거나 팀이 사라져도 캐시는 남아 있어서,
            // 팀이 없는데도 팀 모드로 전환되는 문제가 있었다. 켤 때는 항상 서버에 확인한다.
            try {
                const teamInfo = await getMyTeam();
                setTeamId(String(teamInfo.teamId));
                setTeamName(teamInfo.teamName);
            } catch (error) {
                console.log("팀 모드 전환 중 팀 정보 조회 실패:", error);
                clearTeamMode();
                return false;
            }
        }

        const nextTeamMode = !isTeamMode;

        if (!nextTeamMode) {
            if (isLocationSharingRef.current) {
                await setLocationSharing(false);
            } else {
                const id =
                    teamId ??
                    (await SecureStore.getItemAsync("teamId").catch(
                        () => null,
                    ));

                if (id) {
                    await updateLiveLocationSharing(Number(id), false).catch(
                        () => {},
                    );
                }

                isLocationSharingRef.current = false;
                setIsLocationSharing(false);
                await SecureStore.setItemAsync(
                    LIVE_LOCATION_SHARING_KEY,
                    "false",
                );
            }

            setTeamLiveLocations([]);
        }

        setIsTeamMode(nextTeamMode);
        await SecureStore.setItemAsync(
            TEAM_MODE_ENABLED_KEY,
            String(nextTeamMode),
        );
        return true;
    };

    const clearTeamMode = () => {
        setIsTeamMode(false);
        setTeamId(null);
        setTeamName(null);
        setIsLocationSharing(false);
        setTeamLiveLocations([]);
        SecureStore.deleteItemAsync(TEAM_MODE_ENABLED_KEY).catch(() => {});
        SecureStore.deleteItemAsync(LIVE_LOCATION_SHARING_KEY).catch(() => {});
        // 남아 있는 팀 캐시도 함께 지운다. 그대로 두면 다음 전환 때 잘못된 팀으로 붙는다.
        SecureStore.deleteItemAsync("teamId").catch(() => {});
        SecureStore.deleteItemAsync("teamCode").catch(() => {});
        SecureStore.deleteItemAsync("teamName").catch(() => {});
    };

    return (
        <TeamModeContext.Provider
            value={{
                isTeamMode,
                teamId,
                teamName,
                isLocationSharing,
                isLocationSharingLoading,
                isTeamLocationSocketConnected,
                teamLiveLocations,
                currentUserId,
                setIsTeamMode,
                toggleTeamMode,
                setLocationSharing,
                setTeamLiveLocations,
                clearTeamMode,
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
