import { useRenderer, useSources } from '@ws-ui/webform-editor';

import cn from 'classnames';
import { FC, useEffect, useState, useMemo } from 'react';

import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';

import { generateColorPalette, randomColor } from '../shared/colorUtils';

import {
  differenceInDays,
  parseISO,
  startOfWeek,
  endOfWeek,
  endOfMonth,
  isToday,
  startOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  format,
  isSameMonth,
  addDays,
} from 'date-fns';

import { ICalendarProps } from './Calendar.config';

const Calendar: FC<ICalendarProps> = ({
  att1,
  att2,
  property,
  startDate,
  endDate,
  rowHeight,
  color,
  colors = [],
  yearNav,
  borderRadius,
  style,
  className,
  classNames = [],
}) => {
  const { connect } = useRenderer();

  const {
    sources: { datasource: ds },
  } = useSources();

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!ds) return;

    const listener = async (/* event */) => {
      const v = await ds.getValue<any>();
      setData(v);
    };

    listener();

    ds.addListener('changed', listener);

    return () => {
      ds.removeListener('changed', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds]);

  //Add color to data
  const colorgenerated = generateColorPalette(
    data.length,
    ...colors.map((e) => e.color || randomColor()),
  );

  //Test color
  let newData = data.map((obj, index) => ({
    ...obj,
    color: colorgenerated[index],
  }));

  // let newData = data.map((obj, index) => ({
  //   ...obj,
  //   color: index % 3 === 0 ? color1 : index % 3 === 1 ? color2 : color3,
  // }));

  let list: any[] = [];
  for (let j = 0; j < newData.length; j++) {
    const conge = newData[j];
    const num = differenceInDays(parseISO(conge[endDate]), parseISO(conge[startDate]));
    for (let i = 0; i <= num; i++) {
      list.push({
        title: conge[property],
        att1: conge[att1],
        att2: conge[att2],
        startDate: addDays(parseISO(conge[startDate]), i),
        endDate: addDays(parseISO(conge[startDate]), i),
        color: conge.color,
      });
    }
  }

  const congesByDate = useMemo(() => {
    return list.reduce((acc: { [key: string]: any[] }, conge) => {
      const dateKey = format(conge?.startDate, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(conge);
      return acc;
    }, {});
  }, [data]);

  const [showScrollbar, setShowScrollbar] = useState(false);
  const [date, setDate] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  });

  const prevMonth = () => setDate(subMonths(date, 1));
  const nextMonth = () => setDate(addMonths(date, 1));
  const nextYear = () => setDate(addMonths(date, 12));
  const prevYear = () => setDate(subMonths(date, 12));

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="calendar-container flex flex-col gap-4 w-full h-full">
        <div className="calendar-header w-full flex justify-center gap-4 items-center">
          <button
            className="nav-button text-2xl cursor-pointer"
            onClick={prevYear}
            style={{ display: yearNav ? 'block' : 'none' }}
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button className="nav-button text-2xl cursor-pointer" onClick={prevMonth}>
            <MdKeyboardArrowLeft />
          </button>
          <h2 className="month-title w-44 text-center font-medium text-xl">
            {format(date, 'MMMM yyyy')}
          </h2>
          <button className="nav-button text-2xl cursor-pointer" onClick={nextMonth}>
            <MdKeyboardArrowRight />
          </button>
          <button
            className="nav-button text-2xl cursor-pointer"
            onClick={nextYear}
            style={{ display: yearNav ? 'block' : 'none' }}
          >
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>

        <div className="calendar-grid w-full grid justify-center grid-cols-7">
          {weekdays.map((day) => (
            <div key={day} className="weekday-title font-medium text-lg text-center">
              {day}
            </div>
          ))}
          {daysInMonth.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const todaysConges = congesByDate[dateKey] || [];
            return (
              <div
                key={day.toString()}
                className="day-container flex flex-col justify-start items-start gap-1 py-1 px-1 w-full border border-gray-200"
                style={{
                  color: isSameMonth(day, date) ? 'black' : '#C0C0C0',
                  backgroundColor: isSameMonth(day, date) ? 'white' : '#F3F4F6',
                  height: rowHeight,
                }}
              >
                <div className="h-fit w-full">
                  <span
                    className="day-number h-7 w-7 flex items-center justify-center font-medium rounded-full"
                    style={{
                      backgroundColor: isToday(day) ? color : '',
                      color: isToday(day) ? 'white' : '',
                    }}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                <div
                  onMouseEnter={() => setShowScrollbar(true)}
                  onMouseLeave={() => setShowScrollbar(false)}
                  className={`date-content w-full grid grid-cols-1 gap-1 overflow-hidden ${showScrollbar ? 'overflow-y-auto' : ''}`}
                >
                  {todaysConges.map(
                    (
                      conge: {
                        title: string;
                        color: string;
                        att1: string;
                        att2: string;
                      },
                      index,
                    ) => {
                      return (
                        <div
                          className={`element-container px-2 py-1 flex flex-col w-full border-l-4 text-black`}
                          style={{
                            color: isSameMonth(day, date) ? 'black' : '#969696',
                            backgroundColor: isSameMonth(day, date)
                              ? conge?.color + '50'
                              : '#E3E3E3',
                            borderRadius: borderRadius,
                            borderLeftColor: isSameMonth(day, date) ? conge?.color : '#C0C0C0',
                          }}
                        >
                          <span
                            title={conge.title}
                            key={index}
                            className="element-title font-medium "
                          >
                            {conge.title}
                          </span>
                          <div className="element-detail flex">
                            <p className="text-sm basis-1/2 text-start ">{conge.att1}</p>
                            <p className="text-sm basis-1/2 text-end ">{conge.att2}</p>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
