import React, {PureComponent} from 'react';
import {DeviceEventEmitter, EmitterSubscription, StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import Styles from '../../common/styles';
import {createReducerResult, dataToPagingResult, dataToReducerResult, ReducerResult} from '../../utils/requestUtils';
import {Api} from '../../api';
import {followingModel} from '../../api/profile';
import ServiceUtils from '../../utils/serviceUtils';
import {Alert, Button, Theme} from '@yz1311/teaset';
import ToastUtils from '../../utils/toastUtils';

export interface IProps {
  tabIndex?: number;
  navigation?: any;
  userId: string;
}

interface IState {
  dataList: Array<any>;
  loadDataResult: ReducerResult;
  noMore: boolean;
}

export default class base_star_list extends PureComponent<IProps, IState> {
  protected pageIndex: number = 1;
  private scrollListener: EmitterSubscription;
  private refreshListener: EmitterSubscription;
  private _flatList: YZFlatList;

  readonly state:IState = {
    dataList: [],
    loadDataResult: createReducerResult(),
    noMore: false
  };

  constructor(props) {
    super(props);
    this.scrollListener = DeviceEventEmitter.addListener(
      'list_scroll_to_top',
      ({tabIndex}) => {
        if (tabIndex === this.props.tabIndex) {
          //@ts-ignore
          this._flatList && this._flatList._scrollToTop();
        }
      },
    );
    this.refreshListener = DeviceEventEmitter.addListener(
      'list_refresh',
      ({tabIndex}) => {
        if (tabIndex === this.props.tabIndex) {
          this._flatList && this._flatList._onRefresh();
        }
      },
    );
  }

  componentDidMount(): void {
    this.loadData();
  }

  componentWillUnmount() {
    this.scrollListener.remove();
    this.refreshListener.remove();
  }

  onRefresh = ()=>{
    this._flatList&&this._flatList._onRefresh();
  }

  loadData = async ()=>{
    try {
      let response = await Api.profile.getStarListByUserId({
        request: {
          userId: this.props.userId,
          pageIndex: this.pageIndex
        }
      });
      let pagingResult = dataToPagingResult(this.state.dataList,response.data || [],this.pageIndex,30);
      this.setState({
        ...pagingResult
      });
    } catch (e) {
      this.setState({
        loadDataResult: dataToReducerResult(e)
      });
    }
  }

  unStar = async (item: followingModel)=>{
    ToastUtils.showLoading();
    try {
      let response = await Api.profile.unfollowUser({
        request: {
          userUuid: item.uuid
        }
      });
      if(response.data.IsSucceed) {
        //刷新列表
        this.onRefresh();
        ToastUtils.showToast('取消成功!');
      } else {
        ToastUtils.showToast('取消失败!');
      }
    } catch (e) {

    } finally {
      ToastUtils.hideLoading();
    }
  }

  _renderItem = ({item, index}:{item: followingModel,index:number}) => {
    return (
      <View style={{backgroundColor:gColors.bgColorF,flexDirection:'row',alignItems:'center',justifyContent:'space-between',
        paddingHorizontal:10,paddingVertical:15}}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => {
            ServiceUtils.viewProfileDetail(
              gStore.dispatch,
              this.props.userId,
              item.avatar,
            );
          }}
          style={{
            flexDirection: 'row',
            alignSelf: 'stretch',
            alignItems: 'center',
          }}>
          <Image
            style={[Styles.avator]}
            resizeMode="contain"
            source={{uri: item?.avatar}}
          />
          <Text style={[Styles.userName]}>{item?.name}</Text>
        </TouchableOpacity>
        <Button title={'取消关注'} onPress={()=>{
          Alert.alert('','是否取消关注?',[{
            text: '返回',
          }, {
            text: '取消关注',
            style: 'destructive',
            onPress:()=>{
              this.unStar(item);
            }
          }])
        }}/>
      </View>
    );
  };

  render() {
    console.log(this.state.dataList)
    return (
      <View style={[Styles.container]}>
        <YZStateView
          loadDataResult={this.state.loadDataResult}
          placeholderTitle="暂无数据"
          errorButtonAction={this.loadData}>
          <YZFlatList
            ref={ref => (this._flatList = ref)}
            renderItem={this._renderItem}
            data={this.state.dataList}
            loadDataResult={this.state.loadDataResult}
            noMore={this.state.noMore}
            initialNumToRender={20}
            loadData={this.loadData}
            onPageIndexChange={pageIndex => {
              this.pageIndex = pageIndex;
            }}
            ItemSeparatorComponent={() => (
              <View style={{height: Theme.onePix, backgroundColor: gColors.borderColor}} />
            )}
          />
        </YZStateView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  avator: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});
