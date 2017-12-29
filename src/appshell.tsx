import * as React from "react";
import { Text, View } from "react-native";
import PouchDB from "pouchdb-react-native";

interface Entity {
    name: string;
}

class AppShell extends React.Component {
    componentDidMount() {
        console.log("componentDidMount");
        const db = new PouchDB<Entity>("sample1");
        db.put({
                _id: "some random stuff",
                name: "name"
            })
            .then(res => {
                console.debug("Trying to attach to this.");
            })
            .catch(res => {
                console.warn("Something bad just happened...");
            });

        setTimeout(() => {
            db.get("some random stuff")
                .then(r => {
                    console.log("point to check what is going on here.");
                })
                .catch(res => {
                    console.warn("failed to fetch the information from the database.");
                });
        }, 10000);
    }

    public render() {
        return (
            <View style={{ flex: 1 }}>
                <Text>Bootstrapping the application</Text>
            </View>
        )
    }
}

export { AppShell };