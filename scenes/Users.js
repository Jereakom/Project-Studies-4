import React, { Component, PropTypes } from 'react';
import Friendlist from './Friendlist.js';
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
var Userlist = [];
var ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});
const propTypes = {
  children: PropTypes.node.isRequired
};
export default class Users extends Component {
  constructor(props){
    super(props)
    this.state = {
      friend: undefined,
      viewChange: undefined,
    };
  }
  componentDidMount() {
    Userlist = [];
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.setState({viewChange: Friendlist})
      return true;
    });
    this.fetchUsers();
  }

  componentWillUnmount(){
    BackAndroid.removeEventListener('hardwareBackPress');
  }
  createList() {
    this.setState({dataSource: ds.cloneWithRows(Userlist)})
    this.setState({hasFetched: true});
  }
  async addFriend(friend){
    var logged_user = await AsyncStorage.getItem('username');
    var id = await AsyncStorage.getItem('id_token');
    var details = {
    'funame': logged_user,
    'suname': friend
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    console.log(formBody);
       fetch("http://thegrid.northeurope.cloudapp.azure.com/users/" + id + "/friends", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody
      })
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({viewChange: Friendlist});
      })
      .done();
  }
  async fetchUsers(){
    const logged_user = await AsyncStorage.getItem('username');
    var already_friends = this.props.children;
    fetch("http://thegrid.northeurope.cloudapp.azure.com/users/")
   .then((response) => response.json())
   .then((responseData) => {
      for(var i=0;i<responseData.length;i++) {
        var add_it = true;
        if (responseData[i].username != logged_user) {
          for(var j=0;j<already_friends.length;j++) {
            if (already_friends[j] == responseData[i].username) {
                add_it = false;
            }
          }
          if (add_it) {
            Userlist.push(responseData[i].username);
          }
        }
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
          <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>Follow</Text>
      </View>
      <View style={{flexDirection: 'row', height: height-45, width:width, padding: 10, backgroundColor: 'white'}}>
    <ListView
      dataSource={this.state.dataSource}
      renderRow={(rowData) =>
        <TouchableOpacity onPress={() => this.addFriend(rowData)}>
        <Text style={{marginTop:10, marginBottom:10,fontSize: 20, fontWeight: 'bold', color: '#324563'}}>{rowData}</Text>
        </TouchableOpacity>
      }
      renderSeparator={this._renderSeparator}
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
  },
  button: {
    height: 40,
    backgroundColor: '#ffffff',
    borderColor: '#324563',
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 18,
    color: '#324563',
    alignSelf: 'center'
  },
});
