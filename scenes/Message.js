/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} from 'react-native';
let id = 0;

export default class Message extends Component {

  constructor(props) {
    super(props)
  }

  watchID: ?number = null;

  render() {
    console.log("beer");
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          this.props.message
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
   ...StyleSheet.absoluteFillObject,
   height: 500,
   width: 325,
   justifyContent: 'flex-end',
   alignItems: 'center',
 },
  message: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

AppRegistry.registerComponent('thegrid', () => thegrid);
