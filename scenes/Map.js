/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component, PropTypes } from 'react';
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
import guy from './src/guy.png';
import Camera from './Camera.js';
import Button from 'react-native-button';
const { width, height } = Dimensions.get('window');
let id = 0;

export default class Map extends React.Component {
  props = {
    navigator,
  }

  constructor(props){
    super(props)
    this.state = {
    example: undefined,
      latitude: 0.0,
      longitude: 0.0,
      markers: [],
      image: undefined
    };
  }

  watchID: ?number = null;

  componentDidMount() {
  this.setState({example: undefined});
    navigator.geolocation.getCurrentPosition(
      (position) => {
        var latitude = parseFloat(position["coords"]["latitude"]);
        var longitude = parseFloat(position["coords"]["longitude"]);
        this.setState({latitude: latitude});
        this.setState({longitude: longitude});
        this.setState({
          markers: [
            ...this.state.markers,
            {
              coordinate: {latitude:this.state.latitude,
                longitude:this.state.longitude},
              image:guy,
              key:id++
            },
          ],
        });
      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000}
    );
    this.watchID = navigator.geolocation.watchPosition((position) => {
      var lastPosition = JSON.stringify(position);
      this.setState({lastPosition});
    });
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  renderScene=(route, navigator) => {
    return <Message title={route.title}  message={route.message} />
  }

  markerClick(msg){
    console.log(msg)
    this.props.navigator.push({
      message: msg,
    })
    return (
      <Navigator
        initialRoute={{ title: 'Map', index: 0 }}
        renderScene={this.renderScene}>
      </Navigator>
    )
  }

  render() {
  if (this.state.example) {
        const Example = this.state.example;
        return <Example />;
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
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          {this.state.markers.map(marker => (
            <MapView.Marker
              style={{height : 50, width : 50}}
              key={marker.key}
              coordinate={marker.coordinate}
              pinColor={marker.pinColor}
              image={marker.image}>
              <MapView.Callout tooltip style={styles.customView}>
                <Message>
                  <Image style={{height:250, width:250}} source={{uri: this.state.image}}></Image>
                  <Text style={{color:"white", fontSize:20}}>{marker.description}</Text>
                </Message>
              </MapView.Callout>
            </MapView.Marker>
          ))}
        </MapView>

        <TextInput
          onSubmitEditing={(event) =>
            this.setState({
              markers: [
                ...this.state.markers,
                {
                  coordinate: {latitude:this.state.latitude, longitude:this.state.longitude},
                  description:event.nativeEvent.text,
                  pinColor:'#00ff00',
                  key:id++
                },
              ],
            })
          }
          returnKeyType='go'
          style={{height: 40, width: width}}
          placeholder="Type here to leave a message"
        />
        <TouchableHighlight onPress={() => this.setState({example: Camera})}>
                  <Text>Tap me to load the next scene</Text>
                </TouchableHighlight>
      </View>
    );
  }

  _handlePress(event) {
       console.log('Pressed!');
     };
}

Map.propTypes = {
  provider: MapView.ProviderPropType,

}
const styles = StyleSheet.create({
  customView: {
    width: width,
  },
  container: {
   ...StyleSheet.absoluteFillObject,
   height: height-40,
   width: width,
   justifyContent: 'flex-end',
   alignItems: 'center',
 },
 map: {
   ...StyleSheet.absoluteFillObject,
   height: height-80,
 },
});

AppRegistry.registerComponent('thegrid', () => thegrid);
