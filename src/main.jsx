import React from 'react';
import ReactDOM from 'react-dom/client';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday'; // 用于处理周的插件
import isoWeek from 'dayjs/plugin/isoWeek'; // 用于处理ISO周的插件
import 'dayjs/locale/zh-cn'; // 导入中文语言包
import App from './App';
import './index.css';

// 设置 dayjs 的默认语言为中文
dayjs.locale('zh-cn');
dayjs.extend(weekday);
dayjs.extend(isoWeek);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
