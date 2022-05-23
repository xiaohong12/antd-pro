import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { SettingDrawer } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history, Link } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
import  { BookOutlined, LinkOutlined } from '@ant-design/icons';
import defaultSettings from '../config/defaultSettings';
import { getMenues } from "./services/ant-design-pro/api"
import { fromatMenue } from './app_config';
import * as allIcons from '@ant-design/icons';
import React from 'react';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    //水印
    // waterMarkProps: {
    //   content: initialState?.currentUser?.name,
    // },
    footerRender: () => <Footer />,
    onPageChange: async () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !==  loginPath) {
        history.push(loginPath);
      }
    },
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev&&!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    menu:{
      defaultOpenAll:true,
      locale:true,
      request: async()=>{
          const menue=await getMenues()
          return fromatMenue(menue.data.routes)
      }
    },
    menuDataRender:(menuData:any[])=>{
     return  fixMenuItemIcon(menuData)
    },

menuItemRender: (menuItemProps, defaultDom) => {
  if (menuItemProps.isUrl || !menuItemProps.path) {
   return defaultDom;
  }
  return (<Link to={menuItemProps.path}><p>
    {
    menuItemProps.pro_layout_parentKeys&& 
    menuItemProps.pro_layout_parentKeys.length > 0 &&
    menuItemProps.icon}{defaultDom}</p></Link>
  )},
    ...initialState?.settings,
  };
};

const ResponseInterceptors = async (response: Response, options: any) => {
  const res = await response.clone().json(); //这里是关键，获取所有接口请求成功之后的数据
  //token失效
  if(res.code=="99999"){
    window.localStorage.clear()
    history.push(loginPath)
  }
  return response
}

export const request: RequestConfig = {
  responseInterceptors: [ResponseInterceptors],
};

 const fixMenuItemIcon = (menus:any[], iconType = 'Outlined') => {
  menus.length > 0 &&
    menus.forEach((item) => {
      const { icon, routes } = item;
      if (item?.hideInMenu == 0 || !item?.hideInMenu) {
        if (typeof icon === 'string') {
          const fixIconName = icon.slice(0, 1).toLocaleUpperCase() + icon.slice(1) + iconType;
          let Element = allIcons[fixIconName] || allIcons[icon] || '';
          item.icon = Element ? React.createElement(Element) : '';
        }
        routes && routes.length > 0 ? (item.children = fixMenuItemIcon(routes)) : null;
      }
    });
  return menus;
};