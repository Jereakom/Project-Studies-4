import React, { Component } from 'react';
import Map from './Map.js';
import Users from './Users.js';
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
var username = undefined;
var email = undefined;
var id = undefined;
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
    this.fetchProfileData();
  }

  componentWillUnmount(){
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  async fetchProfileData(){
    username = await AsyncStorage.getItem('username');
    email = await AsyncStorage.getItem('email');
    id = await AsyncStorage.getItem('id_token');
    this.setState({hasFetched: true});
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
          <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>My Profile</Text>
      </View>
      <View style={{flexDirection: 'column', height: height-90, width:width, padding: 10, backgroundColor: 'white'}}>
    <Text style={{marginTop:10, marginBottom:10,fontSize: 20, fontWeight: 'bold', color: '#324563'}}>User ID : {id}</Text>
    <Text style={{marginTop:10, marginBottom:10,fontSize: 20, fontWeight: 'bold', color: '#324563'}}>Username : {username}</Text>
    <Text style={{marginTop:10, marginBottom:10,fontSize: 20, fontWeight: 'bold', color: '#324563'}}>Email : {email}</Text>
    <TouchableOpacity style={styles.button_edit} onPress={() => this.setState({viewChange: Profile})}>
      <Text style={styles.buttonText}>Edit Profile</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button_delete} onPress={() => this.setState({viewChange: Profile})}>
      <Text style={styles.buttonText}>Delete Account</Text>
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
  button_edit: {
    position: 'absolute',
    bottom:0,
    left:0,
    height: 45,
    width: width/2,
    backgroundColor: '#324563',
    borderColor: '#5576aa',
    borderWidth: 2,
    borderRadius: 30,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  button_delete: {
    position: 'absolute',
    bottom:0,
    right:0,
    height: 45,
    width: width/2,
    backgroundColor: '#cc0000',
    borderColor: '#ff4d4d',
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
