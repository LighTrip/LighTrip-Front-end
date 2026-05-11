import AddPlaceScreen from "@/src/features/place/screens/AddPlaceScreen";
import { Text, View, TouchableOpacity } from "react-native";
import { useState } from 'react'


export default function MapScreen() {
    const [showAdd, setShowAdd] = useState(false)

    if (showAdd) {
        return <AddPlaceScreen />
    }

    return (
        <View
        style={{
            flex: 1,
            backgroundColor: "#1a1a2e",
            alignItems: "center",
            justifyContent: "center",
        }}
        >
            <Text style={{ color: "white", fontSize: 18 }}>지도 페이지</Text>

            <TouchableOpacity onPress={() => setShowAdd(true)}>
                <Text style={{ color: "white", fontSize: 18, marginTop: 20 }}>장소 등록하기</Text>
            </TouchableOpacity>
        </View>
    );
}

// export default function MapScreen() {
//   return <AddPlaceScreen />
// }
