import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
	Text,
	View,
	ListView,
	TouchableOpacity,
	Image,
	Alert,
	CameraRoll,
	BackAndroid,
	Dimensions,
	ToastAndroid
} from 'react-native';

import _ from 'lodash';
import Immutable from 'seamless-immutable';
import Button from 'react-native-button';
import {
	CameraKitGallery,
	CameraKitCamera,
} from 'react-native-camera-kit';
import CreatePost from './CreatePost.js';
import Main from '../index.android.js'
import menu_icon from './src/menu_icon.png';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
const { width, height } = Dimensions.get('window');
const FLASH_MODE_AUTO = "auto";
const FLASH_MODE_ON = "on";
const FLASH_MODE_OFF = "off";
const FLASH_MODE_TORCH = "torch";



export default class Camera extends React.Component {

	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		var imageshow;
		this.state = {
		  viewChange: undefined,
			albums:{},
			albumsDS: ds,
			shouldOpenCamera: false,
			shouldShowListView: false,
			image: null,
			flashMode:FLASH_MODE_AUTO,
      back: false,
		}
	}

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.setState({viewChange: CreatePost, back: true})
      return true;
    });
  }

  componentWillUnmount(){
    BackAndroid.removeEventListener('hardwareBackPress');
  }

	render() {
  	if (this.state.viewChange) {
      const ViewChange = this.state.viewChange;
      if(this.state.back) {
        return (
          <ViewChange>
						{{username: this.props.children["username"]}}
          </ViewChange>
        );
      } else {
				if (this.state.image) {
					return (
						<ViewChange>
							{{image:this.state.image.imageURI, username: this.props.children["username"]}}
						</ViewChange>
					)
				} else {
					ToastAndroid.show("Take a picture first", ToastAndroid.LONG);
				}
      }
    }
  	return (
  		this._renderCameraView()
  	);
	}

	_renderCameraView() {
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
	          <MenuOptions optionsContainerStyle={{marginTop: 45, width: 150, height: 150, backgroundColor: 'white'}}>
		          <MenuOption value={1}>
								<TouchableOpacity style={{ marginHorizontal: 4}} onPress={this.onSwitchCameraPressed.bind(this)}>
									<Text>switch camera</Text>
								</TouchableOpacity>
		          </MenuOption>
	            <MenuOption value={2}>
								<TouchableOpacity style={{ marginHorizontal: 4}} onPress={this.onSetFlash.bind(this, FLASH_MODE_AUTO)}>
									<Text>flash auto</Text>
								</TouchableOpacity>
	            </MenuOption>
	            <MenuOption value={3}>
								<TouchableOpacity style={{ marginHorizontal: 4, }} onPress={this.onSetFlash.bind(this, FLASH_MODE_ON)}>
									<Text>flash on</Text>
								</TouchableOpacity>
	            </MenuOption>
							<MenuOption value={4}>
								<TouchableOpacity style={{ marginHorizontal: 4, }} onPress={this.onSetFlash.bind(this, FLASH_MODE_ON)}>
									<Text>flash on</Text>
								</TouchableOpacity>
							</MenuOption>
							<MenuOption value={5}>
								<TouchableOpacity style={{ marginHorizontal: 4,}} onPress={this.onSetFlash.bind(this, FLASH_MODE_OFF)}>
									<Text>flash off</Text>
								</TouchableOpacity>
							</MenuOption>
							<MenuOption value={6}>
								<TouchableOpacity style={{ marginHorizontal: 4,}} onPress={this.onSetFlash.bind(this, FLASH_MODE_TORCH)}>
									<Text>flash torch</Text>
								</TouchableOpacity>
							</MenuOption>
	          </MenuOptions>
	        </Menu>
	      </View>
				<View style={{ flex:1,  backgroundColor: 'gray'}}>
					<View style={{flex: 1, flexDirection:'column', backgroundColor:'black'}}>
						{this.state.image &&
							<View style={{flex: 1000}}><Image
								style={{ flexDirection:'row', backgroundColor: 'white', flex: 900}}
								source={{uri: this.state.image.imageURI, scale: 3}}
							/>
							<TouchableOpacity style={styles.button3} onPress={() => this.setState({image: undefined})}>
								<Text style={styles.buttonText}>Cancel</Text>
							</TouchableOpacity></View>}
						<CameraKitCamera
							ref={(cam) => {
	              this.camera = cam;
	            }}
							style={{flex: 1}}
							cameraOptions= {{
	              flashMode: 'auto',
	              focusMode: 'on',
	              zoomMode: 'on'
	            }}
						/>
					</View>

					<View style={{flexDirection: 'row'}}>
						<TouchableOpacity style={styles.button} onPress={this.onTakeIt.bind(this)}>
							<Text style={styles.buttonText}>Take a picture</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.button} onPress={() => this.savePicture()}>
							<Text style={styles.buttonText}>Confirm</Text>
						</TouchableOpacity>
					</View>
				</View>
			</MenuContext>
		)
	}
  savePicture() {
    this.setState({viewChange: CreatePost})
  }
	async onSwitchCameraPressed() {
		const success = await this.camera.changeCamera();
	}

	async onSetFlash(flashMode) {
		const success = await this.camera.setFlashMode(flashMode);
	}

	async onTakeIt() {
		const imageURI = await this.camera.capture(true);
		let newImage = {imageURI: "file://" + imageURI.uri};
		this.setState({...this.state, image:newImage});
	}
}

const styles = StyleSheet.create({
  button: {
		width: width/2,
    height: 60,
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 2,
    borderRadius: 8,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
	button3: {
		flex: 100,
		width: width,
    height: 60,
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 2,
    borderRadius: 8,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 18,
    color: '#324563',
    alignSelf: 'center'
  },
})
