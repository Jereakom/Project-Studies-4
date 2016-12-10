
import React, { Component } from 'react';
import Map from './Map.js';
import {
  AppRegistry,
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Alert,
  Image,
  Dimensions
} from 'react-native';
import logo from './src/logo.png';
const { width, height } = Dimensions.get('window');
//var t = require('tcomb-form-native');
var t = require('tcomb-form-native');
var _ = require('lodash');

const stylesheet = _.cloneDeep(t.form.Form.stylesheet);

stylesheet.textbox.normal.color = '#ffffff';
stylesheet.controlLabel.normal.color = '#ffffff';

var STORAGE_KEY = 'id_token';

var Form = t.form.Form;

var Person = t.struct({
  username: t.String,
  password: t.String
});

const options = {
  fields: {
    username: {
      stylesheet: stylesheet
    },
    password: {
      stylesheet: stylesheet
    }
  }
};

export default class login extends Component {
  constructor(props){
    super(props)
    this.state = {
      viewChange: undefined
    };
  }

  async _onValueChange(item, selectedValue) {
    try {
      console.log("before AsyncStorage.setItem");
      await AsyncStorage.setItem(item, selectedValue);
      console.log("after AsyncStorage.setItem");
      this.setState({viewChange: Map});
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  };

  _userLogin() {
    var value = this.refs['form'].getValue();
    var details = {
    'username': value.username,
    'password': value.password
};

var formBody = [];
for (var property in details) {
  var encodedKey = encodeURIComponent(property);
  var encodedValue = encodeURIComponent(details[property]);
  formBody.push(encodedKey + "=" + encodedValue);
}
formBody = formBody.join("&");
console.log(formBody);
    if (value) { // if validation fails, value will be null
       console.log("before fetching");
       fetch("http://thegrid.northeurope.cloudapp.azure.com/login", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody
      })
      .then((response) => response.json())
      .then((responseData) => {
        console.log("before _onValueChange");
        this._onValueChange(STORAGE_KEY, responseData.username);
      })
      .done();
    }
  };

  render() {
    if (this.state.viewChange) {
      const ViewChange = this.state.viewChange;
      return (
        <ViewChange/>
      );
    }
    else {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Image
            style={{width:width, height:100, marginBottom: 30}}
            source={require('./src/logo.png')}
          />
        </View>
        <View style={styles.row}>
          <Form
            ref="form"
            type={Person}
            options={options}
          />
        </View>
        <View style={styles.row}>

          <TouchableHighlight style={styles.button} onPress={this._userLogin.bind(this)} underlayColor='#ffffff'>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableHighlight>

        </View>
        <View style={styles.row}>

        </View>
      </View>
    );
  }
  }
}

var styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#324563',
    height:height
  },
  title: {
    fontSize: 30,
    alignSelf: 'center',
    marginBottom: 30
  },
  buttonText: {
    fontSize: 18,
    color: '#324563',
    alignSelf: 'center'
  },
  button: {
    height: 36,
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
});
