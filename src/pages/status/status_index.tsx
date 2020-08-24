import React, {Component} from 'react';
import {
  DeviceEventEmitter,
  EmitterSubscription,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import {Styles} from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import ScrollableTabView, {
  ScrollableTabBar,
} from '@yz1311/react-native-scrollable-tab-view';
import BaseStatusList from './base_status_list';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ActionButton from 'react-native-action-button';
import {ReduxState} from '../../reducers';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {Theme} from "@yz1311/teaset";

interface IProps extends IReduxProps {
  navigation: any;
  initialPage?: number;
  tabNames?: Array<string>;
  isLogin?: boolean;
  tabIndex: number;
}

interface IState {
  tabNames: Array<string>;
  isActionButtonVisible: boolean;
}

export enum StatusTypes {
  '全站' = 'all',
  '我回应' = 'mycomment',
  '关注' = 'following',
  '我的' = 'my',
  '新回应' = 'recentcomment',
  '提到我' = 'mention',
  '回复我' = 'comment',
  '搜索' = 'search',
  标签 = 'tag'
}

@(connect(
  (state: ReduxState) => ({
    isLogin: state.loginIndex.isLogin,
  }),
  dispatch => ({
    dispatch,
  }),
) as any)
export default class status_index extends Component<IProps, IState> {

  private toggleActionButtonListener: EmitterSubscription;
  private tabBar: any;

  constructor(props) {
    super(props);
    this.state = {
      tabNames: [
        '全站',
        '我回应',
        '关注',
        '我的',
        '新回应',
        '提到我',
        '回复我',
      ],
      isActionButtonVisible: true,
    };
    this.toggleActionButtonListener = DeviceEventEmitter.addListener(
      'toggleActionButton',
      state => {
        this.setState({
          isActionButtonVisible: state || false,
        });
      },
    );
  }

  componentDidMount() {
    this.props.navigation.setOptions({
      rightAction: () => {
        this.props.navigation.navigate('StatusAdd');
      },
    });
  }

  componentWillUnmount() {
    this.toggleActionButtonListener && this.toggleActionButtonListener.remove();
  }

  _onChangeTab = obj => {
    DeviceEventEmitter.emit('toggleActionButton', true);
    switch (obj.i) {
      case 0:
        break;
      case 1: //eslint-disable-line
        break;
      case 2:
        break;
    }
  };

  render() {
    const {tabNames} = this.state;
    return (
      <View style={[Styles.container]}>
        <View
          style={{
            height: Theme.statusBarHeight,
            backgroundColor: Theme.navColor,
          }}
        />
        <ScrollableTabView
          renderTabBar={() => (
            <ScrollableTabBar
              ref={bar => (this.tabBar = bar)}
              style={{
                backgroundColor: Theme.navColor,
              }}
              activeTextColor={gColors.bgColorF}
              inactiveTextColor={'#DBDBDB'}
              activeTextFontSize={Theme.px2dp(36)}
              inactiveTextFontSize={Theme.px2dp(30)}
              underlineStyle={{
                backgroundColor: gColors.bgColorF,
                height: 3,
                alignSelf: 'center',
                width: 50,
                borderRadius: 1.5
              }}
            />
          )}
          tabBarPosition="top"
          initialPage={this.props.initialPage || 0}
          scrollWithoutAnimation={true}
          locked={false}
          onChangeTab={this._onChangeTab}>
          <BaseStatusList
            tabLabel="全站"
            navigation={this.props.navigation}
            statusType={StatusTypes.全站}
          />
          <BaseStatusList
              tabLabel="新回应"
              navigation={this.props.navigation}
              statusType={StatusTypes.新回应}
          />
          <BaseStatusList
              tabLabel="关注"
              navigation={this.props.navigation}
              statusType={StatusTypes.关注}
          />
          <BaseStatusList
              tabLabel="我的"
              navigation={this.props.navigation}
              statusType={StatusTypes.我的}
          />
          <BaseStatusList
              tabLabel="我回应"
              navigation={this.props.navigation}
              statusType={StatusTypes.我回应}
          />
          <BaseStatusList
              tabLabel="提到我"
              navigation={this.props.navigation}
              statusType={StatusTypes.提到我}
          />
          <BaseStatusList
              tabLabel="回复我"
              navigation={this.props.navigation}
              statusType={StatusTypes.回复我}
          />
        </ScrollableTabView>
        {this.state.isActionButtonVisible ? (
          <ActionButton
            buttonColor="rgba(231,76,60,1)"
            hideShadow={true}
            onPress={() => {
              if (!this.props.isLogin) {
                NavigationHelper.navigate('Login');
              } else {
                this.props.navigation.navigate('StatusAdd');
              }
            }}
          />
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({});
