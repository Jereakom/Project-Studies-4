import React, { Component, PropTypes } from 'react';
import Groups from './Groups.js';
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
var Grouplist = [];
var ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});
const propTypes = {
  children: PropTypes.node.isRequired
};
export default class JoinGroups extends Component {

  constructor(props){
    super(props)
    this.state = {
      group: undefined,
      viewChange: undefined,
    };
  }

  componentDidMount() {
    Grouplist = [];
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.setState({viewChange: Groups})
      return true;
    });
    this.fetchGroups();
  }

  componentWillUnmount(){
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  createList() {
    this.setState({dataSource: ds.cloneWithRows(Grouplist)})
    this.setState({hasFetched: true});
  }

  async joinGroup(group){
    var id = await AsyncStorage.getItem('id_token');
      fetch("http://thegrid.northeurope.cloudapp.azure.com/users/" + id + "/groups/" + group, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({viewChange: Groups});
      })
      .done();
  }

  async fetchGroups(){
    var already_in_group = this.props.children;
    fetch("http://thegrid.northeurope.cloudapp.azure.com/groups/")
    .then((response) => response.json())
    .then((responseData) => {
      console.log(responseData);
      for(var i=0;i<responseData.length;i++) {
        var add_it = true;
          for(var j=0;j<already_in_group.length;j++) {
            if (already_in_group[j] == responseData[i].name) {
              add_it = false;
            }
          }
          if (add_it) {
            Grouplist.push(responseData[i].name);
          }
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

  render() {
    if (this.state.viewChange) {
      const ViewChange = this.state.viewChange;
      return (
        <ViewChange/>
      );
    }
    if (this.state.hasFetched == true) {
    return (
      <View>
        <View style={{flexDirection: 'row', height: 45, padding: 10, backgroundColor: '#324563'}}>
          <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>Follow</Text>
        </View>
        <View style={{flexDirection: 'row', height: height-45, width:width, padding: 10, backgroundColor: 'white'}}>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={(rowData) =>
              <TouchableOpacity onPress={() => this.joinGroup(rowData)}>
                <Text style={{marginTop:10, marginBottom:10,fontSize: 20, fontWeight: 'bold', color: '#324563'}}>{rowData}</Text>
              </TouchableOpacity>
            }
            renderSeparator={this._renderSeparator}
          />
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
});
