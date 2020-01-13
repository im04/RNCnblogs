import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils, {dataToReducerResult} from "../utils/requestUtils";

export type blogModel = {
  id: string;
  title: string;
  link: string;
  summary: string;
  author: {
    name: string,
    uri: string,
    avatar: string
  };
  blogapp: string;
  published: string;
  views: number;
  comments: number;
  diggs: number;
};

export type blogCommentModel = {
  author: {
    name: string,
    uri: string,
  };
  title: string;
  published: string;
  updated: string;
  content: string;
  Floor: number;
  id: number;
  //本地新增
  UserId: number | string;
};

export type getBlogListRequest = RequestModel<{
  blogApp?: string;
  CategoryType?: string
  ParentCategoryId?: number,
  CategoryId?: number,
  PageIndex: number;
}>;

export type getBlogDetailRequest = RequestModel<{
  id: string;
}>;

export type getBlogCommentListRequest = RequestModel<{
  blogApp?: string;
  postId: number;
  pageIndex: number;
  pageSize: number;
}>;

export const getPersonalBlogList = (data: getBlogListRequest) => {
  const URL = `${gServerPath}/blogs/${data.request.blogApp}/posts?pageIndex=${
    data.request.PageIndex
  }`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取个人博客随笔列表失败!',
    actionType: types.BLOG_GET_PERSONAL_BLOGLIST,
  });
};

export const getPickedBlogList = (data: getBlogListRequest) => {
  const URL = `https://www.cnblogs.com/AggSite/AggSitePostList`;
  return RequestUtils.post(URL,data.request, {
    resolveResult: resolveBlogHtml
  });
};

export const getHomeBlogList = (data: RequestModel<{pageIndex:number, pageSize: number}>) => {
  const URL = `${gServerPath}/blog//sitehome/paged/${data.request.pageIndex}/${data.request.pageSize}`;
  return RequestUtils.get(URL);
};

export const getFollowingBlogList = (data: getBlogListRequest) => {
  const URL = `https://www.cnblogs.com/aggsite/postlistbygroup`;
  return RequestUtils.post(URL,data.request, {
    resolveResult: (result)=>{
      return resolveBlogHtml(result.postList);
    }
  });
};

export const getBlogDetail = (data: getBlogDetailRequest) => {
  const URL = `http://wcf.open.cnblogs.com/blog/post/body/${data.request.id}`;
  return RequestUtils.get<{string:string}>(URL);
};

export const getBlogCommentList = (data: getBlogCommentListRequest) => {
  const URL = `http://wcf.open.cnblogs.com/blog/post/${data.request.postId}/comments/${data.request.pageIndex}/${data.request.pageSize}`;
  return RequestUtils.get<Array<blogCommentModel>>(URL, {
    resolveResult: (result)=>{
      //要重新计算楼层，返回的数据的Floor都只是本页的序号
      result = (result || []).map((x, xIndex) => ({
        ...x,
        Floor: (data.request.pageIndex - 1) * data.request.pageSize + xIndex + 1 }));
      return result;
    }
  });
};

export const getBlogCommentCount = (data: RequestModel<{postId: string}>) => {
  const URL = `https://www.cnblogs.com/xiaoyangjia/ajax/GetCommentCount.aspx?postId=${data.request.postId}`;
  return RequestUtils.get<number>(URL);
}

export const getBlogViewCount = (data: RequestModel<{postId: string}>) => {
  const URL = `https://www.cnblogs.com/xiaoyangjia/ajax/GetViewCount.aspx??postId=${data.request.postId}`;
  return RequestUtils.get<number>(URL);
}


//获取文章的分类和标签
export const getBlogCategoryAndTags = (data:RequestModel<{postId: string,blogId:string}>)=>{
  const URL = `https://www.cnblogs.com/xiaoyangjia/ajax/CategoriesTags.aspx?blogId=${data.request.blogId}&postId=${data.request.postId}`;
  return RequestUtils.get<{category:string,
    categoryUrl: string,
    tags: [
      {
        name: string,
        url: string
      }
    ]
  }>(URL, {
    resolveResult: (result)=>{
      let target = {} as any;
      let category = (result.match(/分类[\s\S]+href=\"[\s\S]+(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'');
      let categoryUrl = (result.match(/分类[\s\S]+href=\"[\s\S]+(?=\<\/a)/)||[])[0]?.replace(/[\s\S]+\>/,'');
      let tags = [] as Array<{name: string, url:string}>;
      let tagMatches = (result.match(/标签[\s\S]+/)||[])[0]?.match(/\<a href=[\s\S]+?(?=\<\/a\>)/g);
      for (let match of (tagMatches||[])) {
        console.log(match)
        console.log(match.match(/href=\"[\s\S]+?\<\/"/))
        tags.push({
          name: match.replace(/[\s\S]+href=\"[\s\S]+?\>/,''),
          url: (match.match(/href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/href=\"/,''),
        })
      }
      return {
        category,
        categoryUrl,
        tags
      };
    }
  });
}

export const commentBlog = data => {
  const URL = `${gServerPath}/blogs/${data.request.blogApp}/posts/${
    data.request.postId
  }/comments`;
  let options = createOptions(data);
  options.body = data.request.comment;
  options.headers['Content-Type'] = 'text/plain';
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '评论博客失败!',
    actionType: types.BLOG_COMMENT_BLOG,
  });
};


export const resolveBlogHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"post_item\"[\s\S]+?(?=(post_item\"))/g)|| [];
  for (let match of matches) {
    let item:Partial<blogModel> = {};
    //解析digg
    item.diggs = parseInt((match.match(/class=\"diggnum\"[\s\S]+?(?=<)/)||[])[0]?.replace(/[\s\S]+>/,''));
    item.link = match.match(((/class=\"titlelnk\" href=\"[\s\S]+?(?=\")/))||[])[0]?.replace(/[\s\S]+="/,'');
    //不能根据link来截取，部分link后面并不是id
    // item.id = item.link.replace(/[\s\S]+\//,'').replace(/\.[\s\S]+$/,'');
    item.id = (match.match(/id=\"digg_count_\d+?(?=\")/)||[])[0]?.replace(/id=\"digg_count_/,'');
    //onclick="DiggPost('xiaoyangjia',11535486,34640,1)">
    item.blogapp = (match.match(/DiggPost\(([\s\S]+,){2}[\s\S]+?(?=,)/)||[])[0]?.replace(/^([\s\S]+,){2}/,'');
    item.title = match.match((/class=\"titlelnk\"[\s\S]+?(?=<)/)||[])[0]?.replace(/[\s\S]+>/,'');
    item.summary = (match.match((/post_item_summary\"[\s\S]+?(?=\<\/p)/))||[])[0]?.replace(/[\s\S]+\>/,'').trim();
    item.author = {
      avatar: (match.match((/class=\"pfs\" src=\"[\s\S]+?(?=\")/))||[])[0]?.replace(/[\s\S]+\"/,''),
      name: match.match(((/class=\"post_item_foot\"[\s\S]+?(?=\<\/a)/))||[])[0]?.replace(/[\s\S]+\>/,''),
      uri: match.match(((/class=\"post_item_foot\"[\s\S]+?href=\"[\s\S]+?(?=\")/))||[])[0]?.replace(/[\s\S]+(?=\")/,''),
    };
    item.published = match.match(((/发布于 [\s\S]+?(?=\s{3,})/))||[])[0]?.replace(/[\s\S]+?(?=\d)/,'');
    item.comments = parseInt((match.match(/评论\([\s\S]+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''));
    item.views = parseInt((match.match(/阅读\([\s\S]+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''));
    items.push(item);
  }
  return items;
}
