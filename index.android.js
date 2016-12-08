/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import Map from './scenes/Map.js';
import Camera from './scenes/Camera.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator,
} from 'react-native';

export default class thegrid extends React.Component {

  watchID: ?number = null;

  render() {
    return (
      <Navigator
        initialRoute={{ title: 'Main view', index: 0 }}
        renderScene={(route, navigator) => {
          return <Map title={route.title}

           />
        }}
      />
    );
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

AppRegistry.registerComponent('thegrid', () => thegrid);
