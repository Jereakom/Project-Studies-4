import React, { Component } from 'react';
import Map from './Map.js';
import JoinGroups from './JoinGroups.js';
import CreateGroup from './CreateGroup.js';
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
  ListView
} from 'react-native';
const { width, height } = Dimensions.get('window');
var groups = [];
var groupIds = [];
var ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});

export default class Groups extends Component {
  constructor(props){
    super(props)
    this.state = {
      group: undefined,
      viewChange: undefined,
    };
  }
  componentDidMount() {
    groups = [];
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.setState({viewChange: Map})
      return true;
    });
    this.fetchGroups();
  }

  componentWillUnmount(){
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  createList() {
    this.setState({dataSource: ds.cloneWithRows(groups)})
    this.setState({hasFetched: true});
  }

  async fetchGroups(){
    await AsyncStorage.setItem('GroupChoice', 'other');
    const id = await AsyncStorage.getItem('id_token');
    fetch("http://thegrid.northeurope.cloudapp.azure.com/users/" + id + "/groups")
    .then((response) => response.json())
    .then((responseData) => {
      for(var i=0;i<responseData.length;i++) {
        groups.push(responseData[i].group);
      }
      this.createList();
    })
    .done();
  }

  _renderSeparator(sectionID: number, rowID: number, adjacentRowHighlighted: bool) {
    return (
      <View
        key={`${sectionID}-${rowID}`}
        style={{
          height: adjacentRowHighlighted ? 4 : 3,
          backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#324563',
        }}
        />
    );
  }

  async removeGroup(group) {
    for (var i=0;i<groups.length;i++) {
      if (group.rowData == groups[i]) {
        let url = "http://thegrid.northeurope.cloudapp.azure.com/groups/" + group.rowData;
        await fetch(url, {method: "DELETE"})
      }
    }
    this.setState({viewChange: Groups});
  }

  async leaveGroup(group) {
    const id = await AsyncStorage.getItem('id_token');
    for (var i=0;i<groups.length;i++) {
      if (group.rowData == groups[i]) {
        let url = "http://thegrid.northeurope.cloudapp.azure.com/users/" + id + "/groups/" + group.rowData + "/";
        await fetch(url, {method: "DELETE"})
      }
    }
    this.setState({viewChange: Groups});
  }

  render() {
    if (this.state.viewChange) {
      const ViewChange = this.state.viewChange;
      if (ViewChange == JoinGroups) {
        return (
          <ViewChange>
            {groups}
          </ViewChange>
        );
      }
      else {
        return (
          <ViewChange/>
        );
      }
    }
    if (this.state.hasFetched == true) {
      return (
        <View style={{height: height, backgroundColor: 'white'}}>
          <View style={{flexDirection: 'row', height: 45, padding: 10, backgroundColor: '#324563'}}>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>My Groups</Text>
          </View>
          <View style={{flexDirection: 'row', height: height-90, width:width, padding: 10, backgroundColor: 'white'}}>
            <ListView
              dataSource={this.state.dataSource}
              renderRow={(rowData) =>
                <View>
                  <Text style={{marginTop:10, marginBottom:10,fontSize: 20, fontWeight: 'bold', color: '#324563'}}>{rowData}</Text>
                  <TouchableOpacity style={styles.button4} onPress={() => this.leaveGroup({rowData})}>
                    <Text style={styles.buttonText}>Leave</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button2} onPress={() => this.removeGroup({rowData})}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              }
              renderSeparator={this._renderSeparator}
              />
            <TouchableOpacity style={styles.button} onPress={() => this.setState({viewChange: JoinGroups})}>
              <Text style={styles.buttonText}>Join a Group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button3} onPress={() => this.setState({viewChange: CreateGroup})}>
              <Text style={styles.buttonText}>Create a Group</Text>
            </TouchableOpacity>
          </View>
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

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8
  },
  button: {
    position: 'absolute',
    bottom:0,
    height: 45,
    width: width/2,
    backgroundColor: '#324563',
    borderColor: '#5576aa',
    borderWidth: 2,
    borderRadius: 30,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  button2: {
    position: 'absolute',
    bottom:0,
    left:width-100,
    height: 45,
    width: width/4,
    backgroundColor: '#324563',
    borderColor: '#5576aa',
    borderWidth: 2,
    borderRadius: 30,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  button3: {
    position: 'absolute',
    bottom:0,
    left:width/2,
    height: 45,
    width: width/2,
    backgroundColor: '#324563',
    borderColor: '#5576aa',
    borderWidth: 2,
    borderRadius: 30,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  button4: {
    position: 'absolute',
    bottom:0,
    left:width-180,
    height: 45,
    width: width/4,
    backgroundColor: '#324563',
    borderColor: '#5576aa',
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
