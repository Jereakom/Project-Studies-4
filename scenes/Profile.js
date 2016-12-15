import React, { Component, PropTypes } from 'react';
import Map from './Map.js';
import Users from './Users.js';
import EditProfile from './EditProfile.js'
import DeleteAccount from './DeleteAccount.js'
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
  ListView,
  Alert
} from 'react-native';
const { width, height } = Dimensions.get('window');
var username = undefined;
var email = undefined;
var id = undefined;
var ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});

const propTypes = {
  children: PropTypes.node,
}

export default class Profile extends Component {

  constructor(props){
    super(props)
    this.state = {
      friend: undefined,
      viewChange: undefined,
      hasFetched: false,
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
    if(!this.props.children) {
      username = await AsyncStorage.getItem('username');
      email = await AsyncStorage.getItem('email');
      id = await AsyncStorage.getItem('id_token');
      this.setState({hasFetched: true});
    } else {
      fetch("http://thegrid.northeurope.cloudapp.azure.com/users/")
      .then((response) => response.json())
      .then((responseData) => {
        for(var i=0;i<responseData.length;i++) {
          if(responseData[i].username == this.props.children) {
            id = responseData[i].id.toString();
            username = responseData[i].username;
            this.setState({hasFetched: true});
          }
        }
      })
    }
  }

  _renderOwnProfile() {
    if(!this.props.children) {
      return (
        <View style={{flexDirection: 'column', height: height-170, width:width, padding: 10, backgroundColor: 'white'}}>
        <Text style={{marginBottom:10,fontSize: 20, fontWeight: 'bold', color: '#324563'}}>Email : {email}</Text>
        <TouchableOpacity style={styles.button_edit} onPress={() => this.setState({viewChange: EditProfile})}>
        <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button_delete} onPress={() => this.setState({viewChange: DeleteAccount})}>
        <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
        </View>
      );
    }
  }

  _renderTitle() {
    if(!this.props.children) {
      return (
        <View style={{flexDirection: 'row', height: 45, padding: 10, backgroundColor: '#324563'}}>
        <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>My Profile</Text>
        </View>
      )
    } else {
      return (
        <View style={{flexDirection: 'row', height: 45, padding: 10, backgroundColor: '#324563'}}>
        <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>Profile of {username}</Text>
        </View>
      )
    }
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
        <View style={{height: height, backgroundColor: 'white'}}>
        {this._renderTitle()}
        <View style={{flexDirection: 'column', height: 100, width:width, padding: 10, backgroundColor: 'white'}}>
        <Text style={{marginTop:10, marginBottom:20,fontSize: 20, fontWeight: 'bold', color: '#324563'}}>User ID : {id}</Text>
        <Text style={{fontSize: 20, fontWeight: 'bold', color: '#324563'}}>Username : {username}</Text>
        </View>
        {this._renderOwnProfile()}
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

Profile.propTypes = propTypes;

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
