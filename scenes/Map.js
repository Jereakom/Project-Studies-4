import React, { Component } from 'react';
import Message from './Message.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  AsyncStorage,
  Navigator,
  TouchableHighlight,
  Dimensions,
  Image,
  CameraRoll,
  ActivityIndicator
} from 'react-native';
import MapView from 'react-native-maps';
import Camera from './Camera.js';
import login from './login.js';
import Friendlist from './Friendlist.js';
import Button from 'react-native-button';
import guy from './src/guy.png';
import menu_icon from './src/menu_icon.png';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
const { width, height } = Dimensions.get('window');
let id = 0;
const username = undefined;

export default class Map extends Component {


  constructor(props){
    super(props)
    this.state = {
      latitude: 0.0,
      longitude: 0.0,
      markers: [],
      viewChange: undefined,
      message: undefined,
      image: undefined,
      showMap: false,
      isLoggedIn: false
    };
  }

  watchID: ?number = null;

  componentDidMount() {
    this.di = 0;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        var latitude = parseFloat(position["coords"]["latitude"]);
        var longitude = parseFloat(position["coords"]["longitude"]);
        this.setState({latitude: latitude});
        this.setState({longitude: longitude});
      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000}
    );
    this.watchID = navigator.geolocation.watchPosition((position) => {
      var lastPosition = JSON.stringify(position);
      this.setState({lastPosition});
    });
    this.setState({showMap: true});
    CameraRoll.getPhotos({first: 5}).done(
       (data) =>{
          console.log(data);
         this.setState({
           image: data.edges[0].node.image.uri
         })
       },
       (error) => {
         console.warn(error);
       }
     );
     this.isLoggedIn();
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  render() {
    if (this.state.showMap){
    this.lat = this.state.latitude
    this.lon = this.state.longitude
    if (this.state.viewChange) {
      const ViewChange = this.state.viewChange;
      if (ViewChange == Message){
      return (
        <ViewChange>
          <Image style={{height:250, width:250}} source={{uri: this.state.image}}></Image>
          <Text style={{color:"white", fontSize:20}}>{this.state.message}</Text>
        </ViewChange>
      );
    }
    else if (ViewChange == Friendlist || ViewChange == Camera || ViewChange == login) {
    return (
      <ViewChange/>
    );
    }
    }
    if (this.state.isLoggedIn == false) {
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
    else {
    return (
      <MenuContext style={{ flex: 1 }}>
      <View style={{height:45, flexDirection: 'row', backgroundColor: '#324563' }}>
        <View style={{ flex: 1}}>
        <Image
          style={{flex:1, height:40, width:150, marginTop:5, marginHorizontal:5}}
          source={require('./src/logo.png')}
        />
        </View>
        <Menu>
          <MenuTrigger>
          <Image
            style={{height:45, width:45}}
            source={require('./src/menu_icon.png')}
          />
          </MenuTrigger>
          <MenuOptions optionsContainerStyle={{marginTop: 45, width: 150, height: 150, backgroundColor: '#324563'}}>
          <MenuOption value={1}>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>{username}</Text>
          </MenuOption>
            <MenuOption value={2}>
            <TouchableHighlight onPress={() => this.setState({viewChange: Friendlist})}>
              <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>Friendlist</Text>
            </TouchableHighlight>
            </MenuOption>
            <MenuOption value={3}>
            <TouchableHighlight onPress={() => this.logout()}>
              <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>LOGOUT</Text>
            </TouchableHighlight>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
            <View style={styles.container}>
        <MapView
          showsUserLocation={true}
          showsMyLocationButton={true}
          style={styles.map}
          toolbarEnabled={false}
          initialRegion={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          {this.state.markers.map(marker => (
            <MapView.Marker
              ref={ref => { marker.ref = ref; }}
              style={{height : 50, width : 50}}
              key={marker.key}
              coordinate={marker.coordinate}
              pinColor={marker.pinColor}
              image={marker.image}
              onPress={() => this.setState({viewChange: Message, message: marker.description})}>
            </MapView.Marker>
          ))}
        </MapView>
        <TextInput
          onSubmitEditing={(event) =>
            this.setState({
              markers: [
                ...this.state.markers,
                {
                  key:id++,
                  coordinate: {latitude:this.lat, longitude:this.lon},
                  description:event.nativeEvent.text,
                  pinColor:'#00ff00',
                },
              ],
            })
          }
          style={{height: 40, width: width}}
          placeholder="Type here to leave a message"
        />
        <TouchableHighlight onPress={() => this.setState({viewChange: Camera})}>
          <Text>Take a picture</Text>
        </TouchableHighlight>
      </View>
      </MenuContext>
    );
  }
  }
  else {
    return (
      <ActivityIndicator
        style={[styles.loading, {height: 80}]}
        size="large"
      />
    )
  }
}

async logout() {
  try {
    await AsyncStorage.removeItem('id_token');
    this.setState({viewChange: login});
  } catch (error) {
    console.log('AsyncStorage error: ' + error.message);
  }
}

async isLoggedIn() {
  try {
const value = await AsyncStorage.getItem('id_token');
username = value;
console.log("id_token : " + value);
if (value !== null){
  this.setState({isLoggedIn: true})
  console.log("is logged in");
}
else {
  console.log("is NOT logged in");
  this.setState({viewChange: login});
}
} catch (error) {
// Error retrieving data
}
}

}

Map.propTypes = {
  provider: MapView.ProviderPropType,
};

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  customView: {
    width: width,
  },
  menuTriggerText: {
    color: 'lightgrey',
    fontWeight: '600',
    fontSize: 20
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    marginTop: 45,
    height: height-85,
    width: width,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    height: height-150,
  },
  menuOptions: {
    marginTop: 30,
    borderColor: '#ccc',
    borderWidth: 2,
    width: 300,
    height: 200
  },
});

AppRegistry.registerComponent('thegrid', () => thegrid);
