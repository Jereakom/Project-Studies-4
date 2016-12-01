/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import Message from './Message.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  Navigator
} from 'react-native';
import MapView from 'react-native-maps';
import guy from './src/guy.png';
let id = 0;

export default class Map extends Component {
  props = {
    navigator,
  }

  constructor(){
    super()
    this.state = {
      latitude: 0.0,
      longitude: 0.0,
      markers: [],
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
              image={marker.image}
              onPress={() =>
                <Navigator
                  initialRoute={{ title: 'Map', index: 0 }}
                  renderScene={(route, navigator) => {
                    this.props.navigator.push({message: marker.description})
                    return <Message title={route.title}  message={route.message} />
                  }}
                />
              }
            />
          ))}
        </MapView>
        <TextInput
          onSubmitEditing={(event) =>
            this.setState({
              markers: [
                ...this.state.markers,
                {
                  coordinate: {latitude:this.state.latitude, longitude:this.state.longitude+1},
                  description:event.nativeEvent.text,
                  pinColor:'#00ff00',
                  key:id++
                },
              ],
            })
          }
          returnKeyType='go'
          style={{height: 40, width:200}}
          placeholder="Type here to leave a message"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
   ...StyleSheet.absoluteFillObject,
   height: 500,
   width: 325,
   justifyContent: 'flex-end',
   alignItems: 'center',
 },
 map: {
   ...StyleSheet.absoluteFillObject,
   height: 460,
 },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('thegrid', () => thegrid);
