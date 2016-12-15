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
  Dimensions,
  Image,
  CameraRoll,
  ActivityIndicator,
  ToastAndroid,
  ListView,
  ScrollView
} from 'react-native';
import MapView from 'react-native-maps';
import Profile from './Profile.js';
import login from './login.js';
import Groups from './Groups.js';
import Friendlist from './Friendlist.js';
import Button from 'react-native-button';
import menu_icon from './src/menu_icon.png';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
import CreatePost from './CreatePost.js';
import haversine from 'haversine';
const { width, height } = Dimensions.get('window');
let id = 0;
const user_id = undefined;
const username = undefined;
const propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
};
var Friends = [];
var ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});

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
      showAllBGColor: '#324563',
      showAllTextColor: 'white',
      showFriendsBGColor: '#324563',
      showFriendsTextColor: 'white',
      showGroupsBGColor: '#324563',
      showGroupsTextColor: 'white',
      showTaggedBGColor: '#324563',
      showTaggedTextColor: 'white',
      showList: false,
      dataSource: undefined
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
      {enableHighAccuracy: false, maximumAge: 1000000}
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
      if(this.props.children["latitude"]&&this.props.children["longitude"]) {
        this.setState({latitude: this.props.children["latitude"], longitude: this.props.children["longitude"]})
      }
      if(this.props.children["marker"]) {
        this.setState({
          markers: [
            this.props.children["marker"]
          ],
        })
      }
    }
    this.initPreference();
  }

  async getPosts() {
    await AsyncStorage.setItem('GroupChoice', 'other');
    let response = await fetch('http://thegrid.northeurope.cloudapp.azure.com/posts');
    let responseJson = await response.json();
    const user = await AsyncStorage.getItem('username');
    this.setState({markers: []});
    for(var i=0;i<responseJson.length;i++) {
      if(responseJson[i]["username"] == user) {
        this.setState({
          markers: [
            ...this.state.markers,
            {
              username: responseJson[i]["username"],
              key:id++,
              coordinate: {latitude: parseFloat(responseJson[i]["latitude"]), longitude: parseFloat(responseJson[i]["longitude"])},
              description:responseJson[i]["caption"],
              pinColor:'#4286f4',
              img:responseJson[i]["picture"],
            },
          ],
        })
      } else {
        this.setState({
          markers: [
            ...this.state.markers,
            {
              username: responseJson[i]["username"],
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
        username: this.state.marker["username"],
        caption: this.state.marker["description"],
        image: this.state.marker["img"],
      },
    ]
    var end;
    for(var i=0;i<this.state.markers.length;i++) {
      end = {
        latitude: this.state.markers[i]["coordinate"]["latitude"],
        longitude: this.state.markers[i]["coordinate"]["longitude"]
      };
      if(haversine(start,end, {unit: 'meter'})<=50 && this.state.markers[i] != this.state.marker) {
        messages= [
          ...messages,
          {
            key: id++,
            username: this.state.markers[i]["username"],
            caption: this.state.markers[i]["description"],
            image: this.state.markers[i]["img"]
          },
        ]
      }
    }
    return messages;
  }

  showMessages(marker) {
    var start = {
      latitude: marker["coordinate"]["latitude"],
      longitude: marker["coordinate"]["longitude"]
    };
    var end = {
      latitude: this.lat,
      longitude: this.lon
    };
    if(haversine(start,end, {unit: 'meter'})<=500) {
      this.setState({viewChange: Message, marker: marker})
    } else {
      ToastAndroid.show('You are too far away from the post', ToastAndroid.LONG);
    }
  }
  async fetchGroupList(){
    if (this.state.showList == false) {
      const id = await AsyncStorage.getItem('id_token');
      groupList = [];
      let response = await fetch('http://thegrid.northeurope.cloudapp.azure.com/users/' + id + '/groups');
      groupList = await response.json();
      this.setState({dataSource: ds.cloneWithRows(groupList)});
      this.setState({showList:true});
    }
    else {
      this.setState({showList:false});
    }
  }

  async groupPosts(group) {
    const user = await AsyncStorage.getItem('username');
    let response = await fetch('http://thegrid.northeurope.cloudapp.azure.com/posts/tags/' + group);
    let responseJson = await response.json();
    this.setState({markers: []});
    for(var i=0;i<responseJson.length;i++) {
      if(responseJson[i]["username"] == user) {
        this.setState({
          markers: [
            ...this.state.markers,
            {
              username: responseJson[i]["username"],
              key:id++,
              coordinate: {latitude: parseFloat(responseJson[i]["latitude"]), longitude: parseFloat(responseJson[i]["longitude"])},
              description:responseJson[i]["caption"],
              pinColor:'#4286f4',
              img:responseJson[i]["picture"],
            },
          ],
        })
      } else
      {
        this.setState({
          markers: [
            ...this.state.markers,
            {
              username: responseJson[i]["username"],
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
    await AsyncStorage.setItem('Preference', 'group');
    await AsyncStorage.setItem('GroupChoice', group);
    this.setState({showList:false});
    this.setState({showGroupsBGColor: 'white', showGroupsTextColor: '#324563'});
    this.setState({showFriendsBGColor: '#324563', showFriendsTextColor: 'white'});
    this.setState({showAllBGColor: '#324563', showAllTextColor: 'white'});
    this.setState({showTaggedBGColor: '#324563', showTaggedTextColor: 'white'});
  }

  showGroupList(){
    if (this.state.showList == true){
      return (
        <View style={{height:height/3 , marginTop:height/2, marginLeft:width/2, backgroundColor:'white', borderWidth:2, borderColor:'#324563'}}>
          <ScrollView showsVerticalScrollIndicator>
            <Text style={{marginBottom:10,fontSize: 20, color: 'white', backgroundColor:'#324563'}}> Select a Group</Text>
            <ListView
              dataSource={this.state.dataSource}
              renderRow={(rowData) =>
                <View>
                  <TouchableOpacity onPress={() => this.groupPosts(rowData.group)}>
                    <Text style={{marginTop:10, marginBottom:10,fontSize: 20, fontWeight: 'bold', color: '#324563'}}> {rowData.group}</Text>
                  </TouchableOpacity>
                </View>
              }
              />
          </ScrollView>
        </View>
      )
    } else {
      return (
        <TouchableOpacity style={styles.button} onPress={() => this.setState({viewChange: CreatePost})}>
          <Text style={styles.buttonText}>POST SOMETHING WHERE I AM</Text>
        </TouchableOpacity>
      )
    }
  }

  async taggedPosts(){
    await AsyncStorage.setItem('GroupChoice', 'other');
    const user = await AsyncStorage.getItem('username');
    let response = await fetch('http://thegrid.northeurope.cloudapp.azure.com/posts/users/' + user);
    let responseJson = await response.json();
    this.setState({markers: []});
    for(var i=0;i<responseJson.length;i++) {
      if(responseJson[i]["username"] == user) {
        this.setState({
          markers: [
            ...this.state.markers,
            {
              username: responseJson[i]["username"],
              key:id++,
              coordinate: {latitude: parseFloat(responseJson[i]["latitude"]), longitude: parseFloat(responseJson[i]["longitude"])},
              description:responseJson[i]["caption"],
              pinColor:'#4286f4',
              img:responseJson[i]["picture"],
            },
          ],
        })
      } else
      { this.setState({
        markers: [
          ...this.state.markers,
          {
            username: responseJson[i]["username"],
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
}

async friendsPosts() {
  await AsyncStorage.setItem('GroupChoice', 'other');
  const token = await AsyncStorage.getItem('id_token');
  const user = await AsyncStorage.getItem('username');
  var url = "http://thegrid.northeurope.cloudapp.azure.com/users/" + token + "/" + "friends";
  fetch(url)
  .then((response) => response.json())
  .then((responseData) => {
    Friends = [];
    for(var i=0;i<responseData.length;i++) {
      Friends.push(responseData[i].username);
    }
  })
  .done();
  let response = await fetch('http://thegrid.northeurope.cloudapp.azure.com/posts');
  let responseJson = await response.json();
  this.setState({markers : []});
  for(var i=0;i<responseJson.length;i++) {
    for(var o=0;o<Friends.length;o++) {
      if(responseJson[i]["username"] == Friends[o]) {
        this.setState({
          markers: [
            ...this.state.markers,
            {
              username: responseJson[i]["username"],
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
    if(responseJson[i]["username"] == user) {
      this.setState({
        markers: [
          ...this.state.markers,
          {
            username: responseJson[i]["username"],
            key:id++,
            coordinate: {latitude: parseFloat(responseJson[i]["latitude"]), longitude: parseFloat(responseJson[i]["longitude"])},
            description:responseJson[i]["caption"],
            pinColor:'#4286f4',
            img:responseJson[i]["picture"],
          },
        ],
      })
    }
  }
}

async checkPreference(){
  var pref = await AsyncStorage.getItem('Preference');
  if (pref == 'all') {
    this.setState({showList:false});
    this.setState({showAllBGColor: 'white', showAllTextColor: '#324563'});
    this.setState({showFriendsBGColor: '#324563', showFriendsTextColor: 'white'});
    this.setState({showGroupsBGColor: '#324563', showGroupsTextColor: 'white'});
    this.setState({showTaggedBGColor: '#324563', showTaggedTextColor: 'white'});
  }
  else if (pref == 'friends') {
    this.setState({showList:false});
    this.setState({showFriendsBGColor: 'white', showFriendsTextColor: '#324563'});
    this.setState({showAllBGColor: '#324563', showAllTextColor: 'white'});
    this.setState({showGroupsBGColor: '#324563', showGroupsTextColor: 'white'});
    this.setState({showTaggedBGColor: '#324563', showTaggedTextColor: 'white'});
  }
  else if (pref == 'tagged') {
    this.setState({showList:false});
    this.setState({showTaggedBGColor: 'white', showTaggedTextColor: '#324563'});
    this.setState({showFriendsBGColor: '#324563', showFriendsTextColor: 'white'});
    this.setState({showAllBGColor: '#324563', showAllTextColor: 'white'});
    this.setState({showGroupsBGColor: '#324563', showGroupsTextColor: 'white'});
  }
  return pref;
}

async initPreference(){
  var pref = await this.checkPreference();
  var group_choice = await AsyncStorage.getItem('GroupChoice');
  if (pref == 'group' && group_choice!='other') {
    await this.groupPosts(group_choice);
  }
  else if (pref == 'group' && group_choice=='other') {
    await AsyncStorage.setItem('Preference', 'all');
    var pref = await this.checkPreference();
  }
  if (pref != 'group') {
    await this.sync(pref);
  }
}

async changePreference(pref){
  await AsyncStorage.setItem('Preference', pref);
  await this.sync(await this.checkPreference());
}

async sync(pref){
  if (pref == 'all') {
    this.getPosts();
  }
  else if (pref == 'friends') {
    this.friendsPosts();
  }
  else if (pref == 'tagged') {
    this.taggedPosts();
  }
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
              return <View key={id++} style={styles.bubble}><Text key={id++} style={{color:"black", fontSize:20}}>{message.username}</Text><Image resizeMethod={'resize'} style={{width: width, height: 400}} source={{uri: message.image}}></Image><Text key={id++} style={{color:"white", fontSize:20}}>{message.caption}</Text></View>;
              })}
            </ViewChange>
          )
        }
      } else if (ViewChange == CreatePost) {
        return (
          <ViewChange>
            {{username: username}}
          </ViewChange>
        );
      } else {
        return (
          <ViewChange />
        )
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
                style={{flex:1, height:40, width:150, marginHorizontal:5}}
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
              <MenuOptions optionsContainerStyle={{marginTop: 45, width: 150, height: 250, backgroundColor: 'white'}}>
                <MenuOption value={1}>
                  <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white', backgroundColor: '#324563', textAlign: 'center'}}>{username}</Text>
                </MenuOption>
                <MenuOption value={2}>
                  <TouchableOpacity onPress={() => this.setState({viewChange: Profile})}>
                    <Text style={{fontSize: 20, fontWeight: 'bold', color: '#324563'}}>Profile</Text>
                  </TouchableOpacity>
                </MenuOption>
                <MenuOption value={3}>
                  <TouchableOpacity onPress={() => this.setState({viewChange: Friendlist})}>
                    <Text style={{fontSize: 20, fontWeight: 'bold', color: '#324563'}}>Following</Text>
                  </TouchableOpacity>
                </MenuOption>
                <MenuOption value={4}>
                  <TouchableOpacity onPress={() => this.setState({viewChange: Groups})}>
                    <Text style={{fontSize: 20, fontWeight: 'bold', color: '#324563'}}>Groups</Text>
                  </TouchableOpacity>
                </MenuOption>
                <MenuOption value={45}>
                  <TouchableOpacity onPress={() => this.logout()}>
                    <Text style={{fontSize: 20, fontWeight: 'bold', color: '#324563'}}>LOGOUT</Text>
                  </TouchableOpacity>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
          <View style={styles.container}>
            <MapView
              showsUserLocation={true}
              style={styles.map}
              toolbarEnabled={false}
              moveOnMarkerPress={false}
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
                  onPress={() => this.showMessages(marker)}>
                </MapView.Marker>
              ))}
            </MapView>
            {this.showGroupList()}
            <View style={{height:45, flexDirection: 'row', backgroundColor: '#324563' }}>
              <TouchableOpacity style={{height: 45,width: (width)/4,backgroundColor: this.state.showAllBGColor,borderColor: '#324563',borderWidth: 2,borderRadius: 8,alignSelf: 'stretch',justifyContent: 'center',alignItems: 'center'}} onPress={() => this.changePreference('all')}>
                <Text style={{fontSize: 15, fontWeight: 'bold', color: this.state.showAllTextColor}}>ALL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{height: 45,width: (width)/4,backgroundColor: this.state.showFriendsBGColor,borderColor: '#324563',borderWidth: 2,borderRadius: 8,alignSelf: 'stretch',justifyContent: 'center',alignItems: 'center'}} onPress={() => this.changePreference('friends')}>
                <Text style={{fontSize: 15, fontWeight: 'bold', color: this.state.showFriendsTextColor}}>FOLLOWED</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{height: 45,width: (width)/4,backgroundColor: this.state.showGroupsBGColor,borderColor: '#324563',borderWidth: 2,borderRadius: 8,alignSelf: 'stretch',justifyContent: 'center',alignItems: 'center'}} onPress={() => this.fetchGroupList()}>
                <Text style={{fontSize: 15, fontWeight: 'bold', color: this.state.showGroupsTextColor}}>GROUPS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{height: 45,width: (width)/4,backgroundColor: this.state.showTaggedBGColor,borderColor: '#324563',borderWidth: 2,borderRadius: 8,alignSelf: 'stretch',justifyContent: 'center',alignItems: 'center'}} onPress={() => this.changePreference('tagged')}>
                <Text style={{fontSize: 15, fontWeight: 'bold', color: this.state.showTaggedTextColor}}>TAGGED</Text>
              </TouchableOpacity>
            </View>
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
      const user = await AsyncStorage.getItem('username');
      username = user;
      if (value !== null){
        this.setState({isLoggedIn: true})
      }
      else {
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
    height: 60,
    backgroundColor: 'white',
    borderColor: '#324563',
    borderWidth: 2,
    borderRadius: 8,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  buttonShowAll: {
    height: 45,
    width: (width-60)/3,
    backgroundColor: '#324563',
    borderColor: '#324563',
    borderWidth: 2,
    borderRadius: 8,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonShowFriends: {
    height: 45,
    width: (width-60)/3,
    backgroundColor: '#324563',
    borderColor: '#324563',
    borderWidth: 2,
    borderRadius: 8,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonShowGroups: {
    height: 45,
    width: (width-60)/3,
    backgroundColor: '#324563',
    borderColor: '#324563',
    borderWidth: 2,
    borderRadius: 8,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSync: {
    height: 45,
    width: 60,
    backgroundColor: '#324563',
    borderColor: '#324563',
    borderWidth: 2,
    borderRadius: 8,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#324563',
    alignSelf: 'center'
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    marginTop: 45,
    height: height-70,
    width: width,
    justifyContent: 'flex-end',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    height: height-130,
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
