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
  Alert,
  ActivityIndicator,
  BackAndroid,
  AsyncStorage,
  ListView
} from 'react-native';
const { width, height } = Dimensions.get('window');

export default class EditProfile extends Component {
  constructor(props){
    super(props)
    this.state = {
      password : undefined,
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

  deleteButtonPress() {
    Alert.alert(
      'Delete My Account ?',
      'All your posts will also be deleted',
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Delete', onPress: () => this.deleteAccount()},
      ]
    )
  }

  async deleteAccount() {
    const id = await AsyncStorage.getItem('id_token');
    var pass = this.state.password.toString();
    fetch("http://thegrid.northeurope.cloudapp.azure.com/users/" + id, {
      method: "DELETE",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': pass
      }
    })
    .then((response) => response.json())
    .then((responseData) => {
      this.setState({viewChange:Login})
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
      <View style={{flexDirection: 'column', height: height-90, width:width, padding: 10, backgroundColor: 'white'}}>
      <Text style={{marginTop:10, marginBottom:10,fontSize: 20, color: 'white', backgroundColor:'#324563'}}> Insert your current password </Text>
      <View style={{flexDirection: 'row', width:width-20}}>
      <Text style={{marginTop:10, marginBottom:10,fontSize: 20, fontWeight: 'bold', color: '#324563'}}>Password : </Text>
      <TextInput
      style={{flex:1,height: 40, borderColor: '#324563', borderWidth: 2}}
      onChangeText={(password) => this.setState({password})}
      value={this.state.password}
      />
      </View>
      <TouchableOpacity style={styles.button_edit} onPress={() => this.deleteButtonPress()}>
      <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button_delete} onPress={() => this.setState({viewChange: Profile})}>
      <Text style={styles.buttonText}>CANCEL</Text>
      </TouchableOpacity>
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
