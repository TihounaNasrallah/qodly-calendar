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
  attributes,
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

  const colorgenerated = generateColorPalette(
    data.length,
    ...colors.map((e) => e.color || randomColor()),
  );

  let attributeList: any[] = [];
  attributes?.forEach((e) => {
    attributeList.push(e.Attribute);
  });

  let newData = data.map((obj, index) => ({
    ...obj,
    color: colorgenerated[index],
    title: obj[property],
    startDate: obj[startDate],
    endDate: obj[endDate],
    attributes: attributeList.reduce((acc: { [key: string]: any[] }, e) => {
      acc[e] = obj[e];
      return acc;
    }, {}),
    length: differenceInDays(parseISO(obj[endDate]), parseISO(obj[startDate])),
  }));

  console.log(attributeList);

  const congesByDate = useMemo(() => {
    return newData.reduce((acc: { [key: string]: any[] }, conge) => {
      const dateKey = format(parseISO(conge[startDate]), 'yyyy-MM-dd');
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
                    className="day-number h-7 w-7 flex items-center justify-center font-medium rounded-full "
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
                  className={`date-content w-full ${showScrollbar ? 'overflow-y-auto' : ''}`}
                >
                  {todaysConges.map(
                    (
                      conge: {
                        title: string;
                        attributes: { [key: string]: any[] };
                        color: string;
                        length: number;
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
                            className="element-title font-medium line-clamp-2"
                          >
                            {conge.title}
                          </span>

                          {/* <div className="element-detail flex flex-wrap">
                            {attributeList?.map((e) => {
                              return (
                                <p className="attribute text-sm basis-1/2 text-start">
                                  {conge.attributes[e]}
                                </p>
                              );
                            })}
                          </div> */}
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
