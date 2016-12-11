import React, { Component, PropTypes } from 'react';
import Message from './Message.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  AsyncStorage,
  Navigator,
  TouchableOpacity,
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
import menu_icon from './src/menu_icon.png';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
import CreatePost from './CreatePost.js';
import haversine from 'haversine';
const { width, height } = Dimensions.get('window');
let id = 0;
const user_id = undefined;
const propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
};

export default class Map extends Component {

  constructor(props){
    super(props)
    this.state = {
      latitude: undefined,
      longitude: undefined,
      markers: [],
      viewChange: undefined,
      message: undefined,
      image: undefined,
      showMap: false,
      isLoggedIn: false,
      marker: undefined,
      messages: [],
    };
  }

  watchID: ?number = null;

  componentDidMount() {
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
      if(lastPosition["coords"]) {
        this.setState({latitude: parseFloat(lastPosition["coords"]["latitude"]), longitude: parseFloat(lastPosition["coords"]["longitude"])});
      }
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
    if(this.props.children) {
      if(this.props.children["marker"]) {
        this.setState({
          markers: [
            this.props.children["marker"]
          ],
        })
      }
    }
    this.getPosts();
  }

  async getPosts() {
    let response = await fetch('http://thegrid.northeurope.cloudapp.azure.com/posts');
    let responseJson = await response.json();
    for(var i=0;i<responseJson.length;i++) {
      this.setState({
        markers: [
          ...this.state.markers,
          {
            key:id++,
            coordinate: {latitude: parseFloat(responseJson[i]["latitude"]), longitude: parseFloat(responseJson[i]["longitude"])},
            description:responseJson[i]["caption"],
            pinColor:'#00ff00',
            img:responseJson[i]["picture"],
          },
        ],
      })
    }
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  messageList() {
    var start = {
      latitude: this.state.marker["coordinate"]["latitude"],
      longitude: this.state.marker["coordinate"]["longitude"]
    };
    var messages= [
      {
        key: id++,
        caption: this.state.marker["description"],
        image: this.state.marker["img"],
      },
    ]
    console.log(messages);
    var end;
    for(var i=0;i<this.state.markers.length;i++) {
      end = {
        latitude: this.state.markers[i]["coordinate"]["latitude"],
        longitude: this.state.markers[i]["coordinate"]["longitude"]
      };
      if(haversine(start,end, {unit: 'meter'})<=10 && this.state.markers[i] != this.state.marker) {
        messages= [
          ...messages,
          {
            key: id++,
            caption: this.state.markers[i]["description"],
            image: this.state.markers[i]["img"]
          },
        ]
      }
    }
    return messages;
  }

  render() {
    if (this.state.viewChange) {
      const ViewChange = this.state.viewChange;
      if (ViewChange == Message) {
        var messages = this.messageList();
        if (messages.length > 0){
          return (
            <ViewChange>
              {messages.map(function(message){
                return <View key={id++} style={styles.bubble}><Image style={{height:250, width:width}} source={{uri: message.image}}></Image><Text key={id++} style={{color:"white", fontSize:20}}>{message.caption}</Text></View>;
              })}
            </ViewChange>
          )
        }
      }
      else if (ViewChange == Friendlist) {
        return (
          <ViewChange/>
        );
      } else if (ViewChange == CreatePost) {
        return (
          <ViewChange/>
        )
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

    if(this.state.latitude && this.state.longitude) {
      this.lat = this.state.latitude;
      this.lon = this.state.longitude;
    } else {
      this.lat = 0.0;
      this.lon = 0.0;
    }

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
          <MenuOptions optionsContainerStyle={{marginTop: 45, width: 150, height: 150, backgroundColor: 'white'}}>
          <MenuOption value={1}>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white', backgroundColor: '#324563'}}>User ID : {user_id}</Text>
          </MenuOption>
            <MenuOption value={2}>
            <TouchableHighlight onPress={() => this.setState({viewChange: Friendlist})}>
              <Text style={{fontSize: 20, fontWeight: 'bold', color: '#324563'}}>Friendlist</Text>
            </TouchableHighlight>
            </MenuOption>
            <MenuOption value={3}>
            <TouchableHighlight onPress={() => this.logout()}>
              <Text style={{fontSize: 20, fontWeight: 'bold', color: '#324563'}}>LOGOUT</Text>
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
          region={{
            latitude: this.lat,
            longitude: this.lon,
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
              onPress={() => this.setState({viewChange: Message, marker: marker})}>
            </MapView.Marker>
          ))}
        </MapView>
        <TouchableOpacity style={styles.button} onPress={() => this.setState({viewChange: CreatePost})}>
          <Text style={styles.buttonText}>Create a post at your location</Text>
        </TouchableOpacity>
      </View>
      </MenuContext>
    );
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
user_id = value;
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
  container: {
    ...StyleSheet.absoluteFillObject,
    marginTop: 45,
    height: height-85,
    width: width,
    justifyContent: 'flex-end',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    height: height-90,
  },
  menuOptions: {
    marginTop: 30,
    borderColor: '#ccc',
    borderWidth: 2,
    width: 300,
    height: 200
  },
  bubble: {
    alignItems: 'center',
    width: width,
    flexDirection: 'column',
    alignSelf: 'flex-start',
    backgroundColor: '#4da2ab',
  },
});
