import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function ProfileView() {
    const router = useRouter();
    const [isTeam, setIsTeam] = useState(false);

    return(
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.headerTitle}>마이페이지</Text>

            {/*프로필 카드*/}
            <View style={styles.profileCard}>
                <View style={styles.profileLeft}>
                    <View style={styles.profileImage}></View>
                    <View>
                        <Text style={styles.userName}>저희이제하조</Text>
                        <View style={styles.locationSection}>
                            <Text style={styles.locationIcon}>아이콘</Text>
                            <Text style={styles.userLocation}>고양시 덕양구</Text>
                        </View>
                        <Text style={styles.userStatus}>12 | 23 | 320</Text>
                    </View>
                </View>

                <View style={styles.idNumberBox}>
                    <Text style={styles.idNumberText}>#30421</Text>
                </View>
            </View>

            {/*프리미엄*/}
            <View style={styles.premiumSection}>
                <Text style={styles.premiumIcon}>아이콘</Text>
                <Text style={styles.premium}>프리미엄</Text>
            </View>
            <TouchableOpacity style={styles.bannerCard} activeOpacity={0.8}>
                <View style={styles.bannerTextBox}>
                    <Text style={styles.bannerTitle}>실물 여권 제작 신청</Text>
                    <Text style={styles.bannerSubtitle}>나만의 탐험 기록을 실물 책으로</Text>
                </View>
                <View style={styles.bannerIcon}>
                    <Text>아이콘</Text>
                </View>
            </TouchableOpacity>

            {/*설정*/}
            <View style={styles.sectionSet}>
                <View style={styles.sectionWrap}>
                    <Text style={styles.sectionIcon}>아이콘</Text>
                    <Text style={styles.sectionTitle}>설정</Text>
                </View>

                <View style={styles.menuBox}>

                    {/*팀 or 개인 설정*/}
                    <View style={[styles.menuItem, styles.menuItemBorder]}>
                        <View style={styles.menuLeft}>
                            <View style={styles.iconBox}></View>
                            <View>
                                <Text style={styles.menuTitle}>팀으로 전환</Text>
                                <Text style={styles.menuDescription}>현재 접속 모드: 개인</Text>
                            </View>
                        </View>
                        <Switch value={isTeam} onValueChange={setIsTeam} />
                    </View>

                    {/*프로필 수정*/}
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemBorder]}
                    activeOpacity={0.8}
                    >
                        <View style={styles.menuLeft}>
                            <View style={styles.iconBox}>
                            </View>
                            <View>
                                <Text style={styles.menuTitle}>프로필 수정</Text>
                                <Text style={styles.menuDescription}>프로필 및 프로필 사진 수정</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/*팀 생성*/}
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemBorder]}
                    activeOpacity={0.8}
                    >
                        <View style={styles.menuLeft}>
                            <View style={styles.iconBox}>
                            </View>
                            <View>
                                <Text style={styles.menuTitle}>팀 생성 및 가입하기</Text>
                                <Text style={styles.menuDescription}>팀에 가입 되어있는 경우 생성 불가합니다</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/*친구*/}
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemBorder]}
                    activeOpacity={0.8}
                    >
                        <View style={styles.menuLeft}>
                            <View style={styles.iconBox}>
                            </View>
                            <View>
                                <Text style={styles.menuTitle}>친구 추가 및 친구 관리</Text>
                                <Text style={styles.menuDescription}>친구 요청을 보내고 받을 수 있습니다</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/*스크랩*/}
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemBorder]}
                    activeOpacity={0.8}
                    >
                        <View style={styles.menuLeft}>
                            <View style={styles.iconBox}>
                            </View>
                            <View>
                                <Text style={styles.menuTitle}>스크랩</Text>
                                <Text style={styles.menuDescription}>"스크랩" 누른 장소 모아보기</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/*테마 설정*/}
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemBorder]}
                    activeOpacity={0.8}
                    >
                        <View style={styles.menuLeft}>
                            <View style={styles.iconBox}>
                            </View>
                            <View>
                                <Text style={styles.menuTitle}>테마 설정</Text>
                                <Text style={styles.menuDescription}>지도 & 도장 테마 변경</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/*계정*/}
            <View style={styles.sectionAccount}>
                <View style={styles.sectionWrap}>
                    <Text style={styles.sectionIcon}>아이콘</Text>
                    <Text style={styles.sectionTitle}>계정</Text>
                </View>

                <View style={styles.menuBox}>

                    {/*개인정보 처리방침*/}
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemBorder]}
                    activeOpacity={0.8}
                    onPress={() => router.push("/profile/privacy")}
                    >
                        <View style={styles.menuLeft}>
                            <View style={styles.iconBox}>
                            </View>
                            <View>
                                <Text style={styles.menuTitle}>개인정보 처리방침</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/*이용약관*/}
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemBorder]}
                    activeOpacity={0.8}
                    onPress={() => router.push("/profile/terms")}
                    >
                        <View style={styles.menuLeft}>
                            <View style={styles.iconBox}>
                            </View>
                            <View>
                                <Text style={styles.menuTitle}>이용약관</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/*구독하기*/}
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemBorder]}
                    activeOpacity={0.8}
                    >
                        <View style={styles.menuLeft}>
                            <View style={styles.iconBox}>
                            </View>
                            <View>
                                <Text style={styles.menuTitle}>구독하기</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/*로그아웃*/}
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemBorder]}
                    activeOpacity={0.8}
                    >
                        <View style={styles.menuLeft}>
                            <View style={styles.iconBox}>
                            </View>
                            <View>
                                <Text style={styles.menuTitle}>로그아웃</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>            
        </ScrollView> 
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: "#090D57",
    },
    content: {
        paddingHorizontal: 20,
        padding: 20,
        paddingBottom: 40,
    },

    /*사용자 정보*/
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 30,
        marginTop: 35,
    },
    profileCard: {
        backgroundColor: "#FE9A00",
        borderRadius: 15,
        padding: 16,
        marginBottom: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    profileLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: 63.99,
        height: 63.99,
        borderRadius: 40265300,
        backgroundColor: "#D9D9D9",
        marginRight: 12,
    },
    userName: {
        color: "#000000",
        fontSize: 24,
        fontWeight: "800",
        marginBottom: 8,
    },
    locationSection: {
        flexDirection: "row",
        marginBottom: 8,
    },
    locationIcon: {
        color: "#FFFFFF",
        marginRight: 8,
        marginTop: -1.5
    },
    userLocation: {
        color: "rgba(64, 64, 64, 0.8)",
        fontSize: 14,
        fontWeight: "500",
    },
    userStatus: {
        color: "rgba(64, 64, 64, 0.8)",
        fontSize: 14,
        fontWeight: "500",
    },
    idNumberBox: {
        justifyContent: "center",
        alignItems: "center",
    },
    idNumberText: {
        color: "rgba(64, 64, 64, 0.8)",
        fontSize: 14,
        fontWeight: "500",
        marginTop: 6,
    },

    /*프리미엄*/
    premiumSection: {
        flexDirection: "row",
    },
    premiumIcon: {
        color: "#FFFFFF",
        marginRight: 10,
    },
    premium: {
        color: "#FFD94C",
        fontSize: 14,
        fontWeight: "800",
        marginBottom: 8,
    },
    bannerCard: {
        backgroundColor: "#C2AA52",
        borderRadius: 15,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 21,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    bannerTextBox: {
        flex: 1,
        marginRight: 8,
    },
    bannerIcon: {
    },
    bannerTitle: {
        color: "#000000",
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 4,
    },
    bannerSubtitle: {
        color: "#000000",
        fontSize: 12,
        fontWeight: "500",
    },

    /*설정, 계정*/
    sectionSet: {
        marginBottom: 20,
    },
    sectionAccount: {
        marginBottom: 130,
    },
    sectionWrap: {
        flexDirection: "row",
    },
    sectionIcon: {
        color: "#FFFFFF",
        marginRight: 10,
    },
    sectionTitle: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "800",
        marginBottom: 4,
    },
    menuBox: {
        backgroundColor: "#060830",
        borderRadius: 14,
        borderWidth: 1.2,
        borderColor: "#262626",
        overflow: "hidden",
    },
    menuItem: {
        minHeight: 75,
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#262626",  
    },
    menuLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#262626",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    menuTitle: {
        color: "#FFC277",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 2,
    },
    menuDescription: {
        color: "#737373",
        fontSize: 12,
    },
});