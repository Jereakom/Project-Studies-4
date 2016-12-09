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
	BackAndroid
} from 'react-native';

import _ from 'lodash';
import Immutable from 'seamless-immutable';

import {
	CameraKitGallery,
	CameraKitCamera,
} from 'react-native-camera-kit';
import CreatePost from './CreatePost.js';
import Main from '../index.android.js'

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
          </ViewChange>
        );
      } else {
        return (
          <ViewChange>
            {{image:this.state.image.imageURI}}
          </ViewChange>
        )
      }
    }
  	return (
  		this._renderCameraView()
  	);
	}

	_renderCameraView() {
		return (
			<View style={{ flex:1,  backgroundColor: 'gray', marginBottom:8}}>
				<View style={{flex: 1, flexDirection:'column', backgroundColor:'black'}} onPress={this.onTakeIt.bind(this)}>
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
					<TouchableOpacity style={{alignSelf:'center', marginHorizontal: 4}} onPress={this.onTakeIt.bind(this)}>
						<Text style={{fontSize: 22, color: 'lightgray', backgroundColor: 'hotpink'}}>TAKE IT!</Text>
					</TouchableOpacity>
				</View>

				<View style={{flexDirection: 'row'}}>
          {this.state.image &&
          <Image
            style={{ flexDirection:'row', backgroundColor: 'white', width: 100, height: 100}}
            source={{uri: this.state.image.imageURI, scale: 3}}
          />}

					<TouchableOpacity style={{alignSelf:'center', marginHorizontal: 4}} onPress={this.onLogData.bind(this)}>
						<Text>log data</Text>
					</TouchableOpacity>

					<TouchableOpacity style={{alignSelf:'center', marginHorizontal: 4}} onPress={this.onSwitchCameraPressed.bind(this)}>
						<Text>switch camera</Text>
					</TouchableOpacity>

					<View style={{ flexDirection:'column', justifyContent: 'space-between'}}>
						<TouchableOpacity style={{ marginHorizontal: 4}} onPress={this.onSetFlash.bind(this, FLASH_MODE_AUTO)}>
							<Text>flash auto</Text>
						</TouchableOpacity>

						<TouchableOpacity style={{ marginHorizontal: 4, }} onPress={this.onSetFlash.bind(this, FLASH_MODE_ON)}>
							<Text>flash on</Text>
						</TouchableOpacity>

						<TouchableOpacity style={{ marginHorizontal: 4,}} onPress={this.onSetFlash.bind(this, FLASH_MODE_OFF)}>
							<Text>flash off</Text>
						</TouchableOpacity>

						<TouchableOpacity style={{ marginHorizontal: 4,}} onPress={this.onSetFlash.bind(this, FLASH_MODE_TORCH)}>
							<Text>flash torch</Text>
						</TouchableOpacity>

						<TouchableOpacity style={{ marginHorizontal: 4,}} onPress={() => this.savePicture()}>
							<Text>BACK</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		)
	}
  savePicture() {
    this.setState({viewChange: CreatePost})
  }
	async onSwitchCameraPressed() {
		const success = await this.camera.changeCamera();
	}

	async onLogData() {
		const success = await this.camera.logData();
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
