import React, { Component } from 'react';
import Map from './Map.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  Navigator,
  TouchableHighlight,
  Dimensions,
  Image,
} from 'react-native';

export default class Friendlist extends Component {
  constructor(props){
    super(props)
    this.state = {
      viewChange: undefined,
    };
  }
  render() {
    if (this.state.viewChange) {
      const ViewChange = this.state.viewChange;
      return (
        <ViewChange/>
      );
    }
    return (
      <View style={{flexDirection: 'row', height: 45, padding: 10, backgroundColor: '#324563'}}>
        <TouchableHighlight onPress={() => this.setState({viewChange: Map})}>
          <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>BACK</Text>
        </TouchableHighlight>
      </View>
    );
  }
}
