import * as React from "react";
import { Text, View } from "react-native";

class AppShell extends React.Component {
    public render() {
        return (
            <View style={{ flex: 1 }}>
                <Text>Bootstrapping the application</Text>
            </View>
        )
    }
}

export { AppShell };