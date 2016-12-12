import React, { Component } from 'react';
import Map from './Map.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  Navigator,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  BackAndroid,
  AsyncStorage,
  ListView
} from 'react-native';
const { width, height } = Dimensions.get('window');
var Friends = [];
var ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});

export default class Friendlist extends Component {
  constructor(props){
    super(props)
    this.state = {
      dataSource: undefined,
      viewChange: undefined,
    };
  }
  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.setState({viewChange: Map})
      return true;
    });
    this.fetchFriends();
  }

  componentWillUnmount(){
    BackAndroid.removeEventListener('hardwareBackPress');
  }
  createList() {
    this.setState({dataSource: ds.cloneWithRows(Friends)})
    this.setState({hasFetched: true});
  }
  async fetchFriends(){
    const id = await AsyncStorage.getItem('id_token');
    fetch("http://thegrid.northeurope.cloudapp.azure.com/users/" + id + "/friends")
   .then((response) => response.json())
   .then((responseData) => {
      for(var i=0;i<responseData.length;i++) {
        Friends.push(responseData[i].username);
      }
      this.createList();
    })
   .done();
  }
  render() {
    if (this.state.viewChange) {
      const ViewChange = this.state.viewChange;
      return (
        <ViewChange/>
      );
    }
    if (this.state.hasFetched == true) {
    return (
      <View>
      <View style={{flexDirection: 'row', height: 45, padding: 10, backgroundColor: '#324563'}}>
          <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>My Friends</Text>
      </View>
      <View style={{flexDirection: 'row', height: height-45, padding: 10, backgroundColor: 'white'}}>
    <ListView
      dataSource={this.state.dataSource}
      renderRow={(rowData) => <Text style={{fontSize: 20, fontWeight: 'bold', color: '#324563'}}>{rowData}</Text>}
    />
      </View>
      </View>
    );
    }
    else {
      return (
        <View style={{height:height, width:width, backgroundColor: '#324563' }}>
        <Text style ={{color:'white',textAlign: 'center',fontSize: 20}}>Loading...</Text>
        <ActivityIndicator
          style={[styles.loading, {height: 40}]}
          size="large"
        />
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8
  }
});
