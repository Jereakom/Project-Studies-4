import React, { Component } from 'react';
import Message from './Message.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  Navigator,
  TouchableHighlight,
  Dimensions,
  Image,
  CameraRoll
} from 'react-native';
import MapView from 'react-native-maps';
import Camera from './Camera.js';
import Button from 'react-native-button';
import guy from './src/guy.png';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
const { width, height } = Dimensions.get('window');
let id = 0;

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
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
    this.watchID = navigator.geolocation.watchPosition((position) => {
      var lastPosition = JSON.stringify(position);
      this.setState({lastPosition});
    });
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  render() {
    this.lat = this.state.latitude
    this.lon = this.state.longitude
    if (this.state.viewChange) {
      const ViewChange = this.state.viewChange;
      return (
        <ViewChange>
          <Image style={{height:250, width:250}} source={{uri: this.state.image}}></Image>
          <Text style={{color:"white", fontSize:20}}>{this.state.message}</Text>
        </ViewChange>
      );
    }
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
    return (
      <MenuContext style={{ flex: 1 }}>
      <TopNavigation/>
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

Map.propTypes = {
  provider: MapView.ProviderPropType,
};
const TopNavigation = () => (
  <View style={{ padding: 10, flexDirection: 'row', backgroundColor: 'black' }}>
    <View style={{ flex: 1 }}><Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>Memento</Text></View>
    <Menu onSelect={(value) => alert(`User selected the number ${value}`)}>
      <MenuTrigger>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>&#8942;</Text>
      </MenuTrigger>
      <MenuOptions>
        <MenuOption value={1}>
          <Text>One</Text>
        </MenuOption>
        <MenuOption value={2}>
          <Text>Two</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  </View>
);
const styles = StyleSheet.create({
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
});

AppRegistry.registerComponent('thegrid', () => thegrid);
