import dayjs from 'dayjs';
import {
  range as _range, chunk as _chunk,
} from 'lodash';
import { SolarDay } from 'tyme4ts';
import {
  memo, useEffect, useRef, useState,
} from 'react';
import { useEventListener, useThrottleFn } from 'ahooks';
import { CURRENT_DAY, WEEK_DAYS } from './constants';
import styles from './style.module.scss';

function returnObj(date, solar, lunarDay) {
  return {
    timestamp: date.valueOf(),
    isCurrentDay: date.isSame(CURRENT_DAY, 'day'),
    fullName: date.format('YYYY-MM-DD'),
    weekNum: date.isoWeekday(),

    solarMonth: date.month() + 1,
    solarDate: date.date(),
    lunarFullName: solar.getLunarDay().toString(), // 农历月和日
    lunarDate: lunarDay.getDay(),
    lunarDateName: lunarDay.getName(),
    lunarMonth: lunarDay.getMonth().getMonth(),
    lunarMonthName: lunarDay.getMonth().getName(),
  };
}

function generateCurrentMonthView() {
  const today = dayjs();
  const startOfMonth = today.startOf('month');
  const startDay = startOfMonth.startOf('isoWeek'); // 使用 ISO 周标准 (周一为一周的第一天)
  const days = _range(0, 42).map((day) => {
    const date = startDay.add(day, 'day');
    const solar = SolarDay.fromYmd(date.year(), date.month() + 1, date.date());
    const lunarDay = solar.getLunarDay();
    return returnObj(date, solar, lunarDay);
  });
  return _chunk(days, 7); // 将42天的日期对象数组分为6组，每组7天
}

function getPreviousSixWeeks(date) {
  const targetDate = dayjs(date);
  // 找到给定日期前一天所在的周的第一天
  const startDay = targetDate.subtract(1, 'day').startOf('isoWeek');
  // 生成从这个开始日往前推的41天的日期对象数组（总共6周，包括当前周）
  const days = _range(-35, 7).map((day) => {
    const date = startDay.add(day, 'day');
    const solar = SolarDay.fromYmd(date.year(), date.month() + 1, date.date());
    const lunarDay = solar.getLunarDay();
    return returnObj(date, solar, lunarDay);
  });
  // 将日期对象数组分为6组，每组7天
  return _chunk(days, 7);
}

function getNextSixWeeks(date) {
  const targetDate = dayjs(date);
  // 找到给定日期后一天所在的周的第一天
  const startDay = targetDate.add(1, 'day').startOf('isoWeek');
  // 生成从这个开始日往后推的41天的日期对象数组（总共6周，包括当前周）
  const days = _range(0, 42).map((day) => {
    const date = startDay.add(day, 'day');
    const solar = SolarDay.fromYmd(date.year(), date.month() + 1, date.date());
    const lunarDay = solar.getLunarDay();
    return returnObj(date, solar, lunarDay);
  });
  // 将日期对象数组分为6组，每组7天
  return _chunk(days, 7);
}

function initList() {
  const currentMonthView = generateCurrentMonthView();
  const previousSixWeeks = getPreviousSixWeeks(currentMonthView[0][0].fullName);
  const nextSixWeeks = getNextSixWeeks(currentMonthView[currentMonthView.length - 1][6].fullName);
  return [...previousSixWeeks, ...currentMonthView, ...nextSixWeeks];
}

/**
 * 渲染阳历日期
 * @param isCurrentDay
 * @param dayItem
 * @returns {JSX.Element}
 */
const RenderSolarDateDayItem = memo(({ isCurrentDay, dayItem }) => {
  if (dayItem.solarDate === 1) {
    return (
      <>
        {dayItem.solarMonth}
        月
        <span className={`${isCurrentDay ? styles.currentDay : ''}`}>{dayItem.solarDate}</span>
        日
      </>
    );
  }
  return (
    <>
      <span className={`${isCurrentDay ? styles.currentDay : ''}`}>{dayItem.solarDate}</span>
      日
    </>
  );
});

/**
 * 渲染农历日期
 * @param dayItem
 * @returns {JSX.Element|string}
 */
const RenderLunarDateDayItem = memo(({ dayItem }) => {
  if (dayItem.lunarDate === 1) {
    return (
      <span className={styles.firstLunarDay}>
        {dayItem.lunarMonthName}
        {dayItem.lunarDateName}
      </span>
    );
  }
  return <span>{dayItem.lunarDateName}</span>;
});

export default function Month() {
  const [list, setList] = useState([...initList()]);
  const [itemHeight, setItemHeight] = useState(0); // '0.0
  const [contentHeight, setContentHeight] = useState(0); // '0.0'
  const [paddingTop, setPaddingTop] = useState(0); // '0.0'
  const dayContentRef = useRef(null);
  const dayListRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      const newItemHeight = Math.floor((window.innerHeight - 100) / 6);
      const newPaddingTop = window.innerHeight - (newItemHeight * 6 + 74);
      setItemHeight(newItemHeight);
      setPaddingTop(newPaddingTop);
      setContentHeight(window.innerHeight - 32 - 42 - newPaddingTop);
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (itemHeight) {
      dayContentRef.current.scrollTop = itemHeight * 6;
    }
  }, [itemHeight, list]);

  const { run: handleScroll } = useThrottleFn(() => {
    const { scrollTop } = dayContentRef.current;
    if (scrollTop === 0) {
      console.log('scrollTop === 0', scrollTop);
      const newList = list.slice(0, -6);
      const previousSixWeeks = getPreviousSixWeeks(newList[0][0].fullName);
      setList([...previousSixWeeks, ...newList]);
    }
    if (scrollTop === itemHeight * 12) {
      console.log('scrollTop === itemHeight * 12', scrollTop);
      const newList = list.slice(6);
      const nextSixWeeks = getNextSixWeeks(newList[newList.length - 1][6].fullName);
      setList([...newList, ...nextSixWeeks]);
    }
  }, { wait: 1 });

  useEventListener(
    'scroll',
    handleScroll,
    { target: dayContentRef },
  );

  return (
    <div className={styles.month}>
      <div
        className={styles.weekTitle}
        style={paddingTop > 0 ? { paddingTop: `${paddingTop}px` } : {}}
      >
        {
          WEEK_DAYS.map((item) => (
            <div className={styles.titleItem} key={item}>{item}</div>
          ))
        }
      </div>
      <div
        ref={dayContentRef}
        className={styles.dayContent}
        style={contentHeight > 0 ? { height: `${contentHeight}px` } : {}}
      >
        <div ref={dayListRef} className={styles.dayList}>
          {
            list.map((dayObj) => (
              <div key={`${dayObj[0].fullName} - ${dayObj[0].timestamp}`} className={styles.weekRow}>
                {
                  dayObj.map((item) => (
                    <div
                      className={`${styles.dayItem} ${(item.weekNum === 6 || item.weekNum === 7) ? styles.weekend : ''}`}
                      key={item.fullName}
                      style={itemHeight > 0 ? { height: `${itemHeight}px` } : {}}
                    >
                      <div className={styles.dayItemDate}>
                        <div className={styles.dayItemLunar}>
                          <RenderLunarDateDayItem dayItem={item} />
                        </div>
                        <div className={styles.dayItemSolar}>
                          <RenderSolarDateDayItem isCurrentDay={item.isCurrentDay} dayItem={item} />
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
