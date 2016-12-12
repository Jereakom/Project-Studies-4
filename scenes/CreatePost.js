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
  TouchableOpacity
} from 'react-native';
let id = 0;
const { width, height } = Dimensions.get('window');
import Icon from 'react-native-vector-icons/FontAwesome';
import Camera from './Camera.js';
import CryptoJS from 'crypto-js';
import api_key from './cloudinary.js';
import api_secret from './cloudinary.js';
import cloud from './cloudinary.js';
const propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
};

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
    let timestamp = (Date.now() / 1000 | 0).toString();
    let hash_string = 'timestamp=' + timestamp + api_secret
    let signature = CryptoJS.SHA1(hash_string).toString();
    let upload_url = 'https://api.cloudinary.com/v1_1/' + cloud + '/image/upload'

    let xhr = new XMLHttpRequest();
    xhr.open('POST', upload_url);
    xhr.onload = () => {
      console.log(xhr);
    };
    let formdata = new FormData();
    formdata.append('file', {uri: uri, type: 'image/png', name: 'upload.png'});
    formdata.append('timestamp', timestamp);
    formdata.append('api_key', api_key);
    formdata.append('signature', signature);
    await xhr.send(formdata);
  }

  _renderMap() {
    var img = this.uploadImage(this.state.markers[0].img);
    var details = {
    'username': this.state.markers[0].username,
    'caption': this.state.markers[0].description,
    'picture': this.state.markers[0].img,
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
            onSubmitEditing={(event) =>
              this.setState({
                markers: [
                  {
                    username:this.props.children["username"],
                    key:id++,
                    coordinate: {latitude:this.lat, longitude:this.lon},
                    description:event.nativeEvent.text,
                    pinColor:'#00ff00',
                    img:img,
                  },
                ],
              })
            }
            style={{height: 80, width: width-60, marginLeft: 10}}
            placeholder="Type here to leave a message"
          />
        </View>
        <TouchableOpacity style={{ marginHorizontal: 4,}} onPress={() => this._renderMap()}>
          <Text>Post</Text>
        </TouchableOpacity>
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
});
