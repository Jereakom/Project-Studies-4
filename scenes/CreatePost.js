import React, { PropTypes } from 'react';
import Map from './Map.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  BackAndroid,
  TextInput,
  TouchableOpacity,
  Image
} from 'react-native';
let id = 0;
const { width, height } = Dimensions.get('window');
import Icon from 'react-native-vector-icons/FontAwesome';
import Camera from './Camera.js';
import CryptoJS from 'crypto-js';
import api from './cloudinary.js';
const propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
};
let xhr = undefined;
let resp = undefined;

export default class CreatePost extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      back: false,
      viewChange: undefined,
      markers: [],
      latitude: 0.0,
      longitude: 0.0,
    };
  }

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
      this.setState({lastPosition});
    });
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.setState({viewChange: Map});
      return true;
    });
  }

  async uploadImage(uri) {
    let api_key = api.api_key;
    let api_secret = api.api_secret;
    let cloud = api.cloud;
    let timestamp = (Date.now() / 1000 | 0).toString();
    let hash_string = 'timestamp=' + timestamp + api_secret;
    let signature = CryptoJS.SHA1(hash_string).toString();
    let upload_url = 'https://api.cloudinary.com/v1_1/' + cloud + '/image/upload';
    let file = {uri: uri, type: 'image/png', name: 'upload.png'};
    var formBody = new FormData();
    formBody.append('file', file);
    formBody.append('timestamp', timestamp);
    formBody.append('api_key', api_key);
    formBody.append('signature', signature);
    fetch(upload_url, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      },
      body: formBody
    })
    .then((response) => response.json())
    .then((responseData) => {
      resp = responseData;
      this._renderMap();
    })
    .done();
  }

  _renderMap() {
    var pic;
    if (resp) {
      if (resp.url != undefined) {
        pic = resp.url;
      } else {
        pic = "";
      }
    } else {
      pic = "";
    }
    var details = {
      'username': this.state.markers[0].username,
      'caption': this.state.markers[0].description,
      'picture': pic,
      'latitude': this.state.markers[0].coordinate["latitude"],
      'longitude': this.state.markers[0].coordinate["longitude"]
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch("http://thegrid.northeurope.cloudapp.azure.com/posts", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    })
    this.setState({viewChange: Map});
  }

  componentWillUnmount(){
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  _renderSubmit(img) {
    if (img == undefined) {
      return (
        <TouchableOpacity style={styles.button} onPress={() => this._renderMap()}>
          <Text style={styles.buttonText}>Post</Text>
        </TouchableOpacity>
      )
    } else {
      return (
        <View>
        <Image
          style={{width:width, height:400}}
          source={{uri: this.props.children["image"]}}
        />
        <TouchableOpacity style={styles.button} onPress={() => this.uploadImage(this.state.markers[0].img)}>
          <Text style={styles.buttonText}>Post</Text>
        </TouchableOpacity>
        </View>
      )
    }
  }

  render() {
    this.lat = this.state.latitude;
    this.lon = this.state.longitude;
    if (this.state.viewChange) {
      const ViewChange = this.state.viewChange;
      if(ViewChange == Map) {
        return (
          <ViewChange>
          </ViewChange>
        )
      } else if(ViewChange == Camera) {
        return (
          <ViewChange>
            {{username: this.props.children["username"]}}
          </ViewChange>
        )
      }
    }
    var img = undefined;
    if(this.props.children) {
      if(this.props.children["image"]) {
        img = this.props.children["image"];
      }
    }
    return (
      <View style={styles.container}>
        <View style={styles.cameraText}>
          <Icon
            style={{marginTop: 40}}
            name="camera"
            size={45}
            color="#000"
            onPress={() => this.setState({viewChange: Camera})} />
          <TextInput
            style = {{flex:1,height: 40, borderColor: '#324563', borderWidth: 2, marginTop: 40}}
            onChangeText={(text) =>
              this.setState({
                markers: [
                  {
                    username:this.props.children["username"],
                    key:id++,
                    coordinate: {latitude:this.lat, longitude:this.lon},
                    description:text,
                    pinColor:'#00ff00',
                    img:img,
                  },
                ],
              })
            }
            placeholder="Type here to leave a message"
            />
        </View>
        {this._renderSubmit(img)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cameraText: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    width: width,
    justifyContent: 'flex-end',
  },
  container: {
    height: height,
    flexDirection: 'column',
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  button: {
    height: 36,
    backgroundColor: '#324563',
    borderColor: '#324563',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  },
});
