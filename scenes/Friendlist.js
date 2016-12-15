import React, { Component } from 'react';
import Map from './Map.js';
import Users from './Users.js';
import Profile from './Profile.js';
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
      friend: undefined,
      viewChange: undefined,
    };
  }
  componentDidMount() {
    Friends = [];
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
  _renderSeparator(sectionID: number, rowID: number, adjacentRowHighlighted: bool) {
    return (
      <View
      key={`${sectionID}-${rowID}`}
      style={{
        height: adjacentRowHighlighted ? 4 : 3,
        backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#324563',
      }}
      />
    );
  }

  async removeFriend(friend) {
    for (var i=0;i<Friends.length;i++) {
      if (friend == Friends[i]) {
        const id = await AsyncStorage.getItem('id_token');
        let url = "http://thegrid.northeurope.cloudapp.azure.com/users/" + id + "/friends/" + friend;
        await fetch(url, {method: "DELETE"})
      }
    }
    this.setState({viewChange: Friendlist});
  }

  friendProfile(friend) {
    this.setState({profileFriend: friend, viewChange: Profile});
  }


  render() {
    if (this.state.viewChange) {
      const ViewChange = this.state.viewChange;
      if (ViewChange == Users) {
        return (
          <ViewChange>
          {Friends}
          </ViewChange>
        );
      } else if(ViewChange == Profile) {
        return (
          <ViewChange>
          {this.state.profileFriend}
          </ViewChange>
        );
      } else {
        return (
          <ViewChange/>
        );
      }
    }
    if (this.state.hasFetched == true) {
      return (
        <View style={{height: height, backgroundColor: 'white'}}>
        <View style={{flexDirection: 'row', height: 45, padding: 10, backgroundColor: '#324563'}}>
        <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>My Follows</Text>
        </View>
        <View style={{flexDirection: 'row', height: height-90, width:width, padding: 10, backgroundColor: 'white'}}>
        <ListView
        dataSource={this.state.dataSource}
        renderRow={(rowData) =>
          <View>
          <TouchableOpacity onPress={() => this.friendProfile(rowData)}>
          <Text style={{marginTop:10, marginBottom:10,fontSize: 20, fontWeight: 'bold', color: '#324563'}}>{rowData}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button2} onPress={() => this.removeFriend(rowData)}>
          <Text style={styles.buttonText}>Remove</Text>
          </TouchableOpacity>
          </View>
        }
        renderSeparator={this._renderSeparator}
        />
        <TouchableOpacity style={styles.button} onPress={() => this.setState({viewChange: Users})}>
        <Text style={styles.buttonText}>Follow</Text>
        </TouchableOpacity>
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
  },
  button: {
    position: 'absolute',
    bottom:0,
    left:width/4,
    height: 45,
    width: width/2,
    backgroundColor: '#324563',
    borderColor: '#5576aa',
    borderWidth: 2,
    borderRadius: 30,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  button2: {
    position: 'absolute',
    bottom:0,
    left:width-100,
    height: 45,
    width: width/4,
    backgroundColor: '#324563',
    borderColor: '#5576aa',
    borderWidth: 2,
    borderRadius: 30,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center',
    fontWeight: 'bold'
  },
});
