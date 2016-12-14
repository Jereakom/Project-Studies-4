import React, { PropTypes } from 'react';
import Map from './Map.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  BackAndroid,
  ScrollView
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
        <ViewChange/>
      );
    }
    return (
      <ScrollView contentContainerStyle={[styles.cont, this.props.style]}>
      {this.props.children}
      </ScrollView>
    );
  }
}

Message.propTypes = propTypes;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    height: height,
  },
});
