/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React from 'react';
import {
  AsyncStorage,
  ListView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View
} from 'react-native';
import PouchDB from "pouchdb-react-native";

const localdb = new PouchDB("testName");
console.log(localdb.adapter);

export default class App extends React.Component<{}> {
  componentDidMount() {
    localdb.put({
      _id: "someidentifier@mail.com",
      name: "Somebody",
      age: 69
    })
      .then(res => {
        console.log("The instance should have been added or updated.");
      })
      .catch(e => {
        console.warn("Something bad just happened...");
        console.warn(e);
      });

    setTimeout(() => {
      localdb.get("someidentifier@mail.com")
        .then(res => {
          console.log(res.name);
        });
    },
      5000);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          {localdb.adapter}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
