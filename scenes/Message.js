/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { PropTypes } from 'react';
import Map from './Map.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  BackAndroid
} from 'react-native';
let id = 0;
const { width, height } = Dimensions.get('window');

const propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
};

export default class Message extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      viewChange: undefined,
    };
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.setState({viewChange: Map})
      return true;
    });
  }

  componentWillUnmount(){
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  render() {
    if (this.state.viewChange) {
      const ViewChange = this.state.viewChange;
      return (
        <ViewChange />
      );
    }
    return (
      <View style={[styles.cont, this.props.style]}>
        <View style={styles.bubble}>
          {this.props.children}
        </View>
        <View style={styles.arrowBorder} />
        <View style={styles.arrow} />
      </View>
    );
  }
}

Message.propTypes = propTypes;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
  },
  bubble: {
    alignItems: 'center',
    width: width,
    flexDirection: 'column',
    alignSelf: 'flex-start',
    backgroundColor: '#4da2ab',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    borderColor: '#007a87',
    borderWidth: 0.5,
  },
  arrow: {
    backgroundColor: 'transparent',
    borderWidth: 16,
    borderColor: 'transparent',
    borderTopColor: '#4da2ab',
    alignSelf: 'center',
    marginTop: -32,
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderWidth: 16,
    borderColor: 'transparent',
    borderTopColor: '#007a87',
    alignSelf: 'center',
    marginTop: -0.5,
  },
});

AppRegistry.registerComponent('thegrid', () => thegrid);
