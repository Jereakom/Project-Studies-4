import React, { Component } from 'react';
import Map from './Map.js';
import Users from './Users.js';
import Profile from './Profile.js'
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
var ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});

export default class EditProfile extends Component {
  constructor(props){
    super(props)
    this.state = {
      email : undefined,
      newpassword : undefined,
      oldpassword : undefined,
      viewChange: undefined,
    };
  }
  componentDidMount() {
    Friends = [];
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.setState({viewChange: Profile})
      return true;
    });
  }

  componentWillUnmount(){
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  async saveNewProfile(res) {
    await AsyncStorage.setItem('email', res.email);
    this.setState({viewChange: Profile});
  }

  async changeProfile(){
    if (this.state.oldpassword != undefined && this.state.oldpassword.length > 0 ) {
    var id = await AsyncStorage.getItem('id_token');
    var username = await AsyncStorage.getItem('username');
    var details = {
    'username': username,
    'newemail': this.state.email,
    'newpassword': this.state.newpassword,
    'password':this.state.oldpassword
    };

    var formBody = [];
    var oldpassword = this.state.oldpassword;
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      if (encodedValue != 'undefined' && encodedValue.length > 0) {
      formBody.push(encodedKey + "=" + encodedValue);
    }
    }
    formBody = formBody.join("&");
    console.log(formBody);
       fetch("http://thegrid.northeurope.cloudapp.azure.com/users/" + id , {
        method: "PUT",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody
      })
      .then((response) => response.json())
      .then((responseData) => {
        this.saveNewProfile(responseData);
      })
      .done();
    }
  }

  render() {
    if (this.state.viewChange) {
      const ViewChange = this.state.viewChange;
      return (
        <ViewChange/>
      );
    }
    return (
      <View>
      <View style={{flexDirection: 'row', height: 45, padding: 10, backgroundColor: '#324563'}}>
          <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>My Profile</Text>
      </View>
      <View style={{flexDirection: 'column', height: height-90, width:width, padding: 10, backgroundColor: 'white'}}>
      <Text style={{marginTop:10, marginBottom:10,fontSize: 20, color: 'white', backgroundColor:'#324563'}}> Insert only what you want to change</Text>
      <View style={{flexDirection: 'row', width:width-20}}>
      <Text style={{marginTop:10, marginBottom:10,fontSize: 20, fontWeight: 'bold', color: '#324563'}}>New Email : </Text>
      <TextInput
              style={{flex:1,height: 40, borderColor: '#324563', borderWidth: 2}}
              onChangeText={(email) => this.setState({email})}
              value={this.state.email}
            />
      </View>
      <View style={{flexDirection: 'row', width:width-20}}>
      <Text style={{marginTop:10, marginBottom:10,fontSize: 20, fontWeight: 'bold', color: '#324563'}}>New password : </Text>
      <TextInput
              style={{flex:1,height: 40, borderColor: '#324563', borderWidth: 2}}
              onChangeText={(newpassword) => this.setState({newpassword})}
              value={this.state.newpassword}
            />
      </View>
      <Text style={{marginTop:10, marginBottom:10,fontSize: 20, color: 'white', backgroundColor:'#324563'}}> Insert your current password </Text>
      <View style={{flexDirection: 'row', width:width-20}}>
      <Text style={{marginTop:10, marginBottom:10,fontSize: 20, fontWeight: 'bold', color: '#324563'}}>Password : </Text>
      <TextInput
              style={{flex:1,height: 40, borderColor: '#324563', borderWidth: 2}}
              onChangeText={(oldpassword) => this.setState({oldpassword})}
              value={this.state.oldpassword}
            />
      </View>
    <TouchableOpacity style={styles.button_edit} onPress={() => this.changeProfile()}>
      <Text style={styles.buttonText}>Confirm</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button_delete} onPress={() => this.setState({viewChange: Profile})}>
      <Text style={styles.buttonText}>CANCEL</Text>
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
