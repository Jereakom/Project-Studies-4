import React, { Component } from 'react';
import Map from './Map.js';
import Groups from './Groups.js';
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
var groups = [];
var ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});

export default class CreateGroup extends Component {

  constructor(props){
    super(props)
    this.state = {
      group: undefined,
      viewChange: undefined,
    };
  }

  componentDidMount() {
    groups = [];
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.setState({viewChange: Groups})
      return true;
    });
  }

  componentWillUnmount(){
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  async createGroup(){
    var id = await AsyncStorage.getItem('id_token');
    var details = {
      'name': this.state.group
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch("http://thegrid.northeurope.cloudapp.azure.com/users/" + id + "/groups", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    })
    .then((response) => response.json())
    .then((responseData) => {
      this.setState({viewChange: Groups});
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
    return (
      <View style={{backgroundColor: 'white'}}>
        <View style={{flexDirection: 'row', height: 45, padding: 10, backgroundColor: '#324563'}}>
          <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>Create a Group</Text>
        </View>
        <TextInput style={{marginTop: 100, height: 40, borderColor: '#324563', borderWidth: 2}} placeholder="Group name" onChangeText={(text) => this.setState({group: text})}/>
        <View style={{flexDirection: 'row', height: height-200, width:width, padding: 10, backgroundColor: 'white'}}>
          <TouchableOpacity style={styles.button} onPress={() => this.createGroup()}>
            <Text style={styles.buttonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
    top:0,
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
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center',
    fontWeight: 'bold'
  },
});
