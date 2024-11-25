import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useMemo } from 'react';

import { ISchedulerProps } from './Scheduler.config';
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';

import { format, startOfWeek, addDays, isToday, setHours, isEqual, setMinutes } from 'date-fns';
import { colorToHex } from '../shared/colorUtils';

import { fr, es, de } from 'date-fns/locale';

const Scheduler: FC<ISchedulerProps> = ({
  yearNav,
  property,
  todayButton,
  weekStart,
  language,
  minutes,
  days,
  hours,
  height,
  timeFormat,
  headerPosition,
  color,
  selectedColor,
  attributes = [],
  style,
  className,
  classNames = [],
}) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

  const date = new Date();
  const startOfWeekInt = parseInt(weekStart, 10) as 0 | 1;
  const firstDayOfWeek = startOfWeek(date, { weekStartsOn: startOfWeekInt });
  const firstHour = useMemo(() => {
    if (hours === 'work') {
      return 8;
    }
    return 0;
  }, [hours]);

  const getWeekDates = (startDate: Date) => {
    const dates = [];
    const startOfCurrentWeek = startOfWeek(startDate, { weekStartsOn: startOfWeekInt });
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startOfCurrentWeek, i));
    }
    return dates;
  };

  const isCurrentHour = (hourIndex: number, mins: number) => {
    const currentHour = new Date().getHours();
    switch (minutes) {
      case '15': {
        return (
          currentHour === hourIndex &&
          new Date().getMinutes() <= mins + 15 &&
          new Date().getMinutes() > mins
        );
      }
      case '30': {
        return (
          currentHour === hourIndex &&
          new Date().getMinutes() <= mins + 30 &&
          new Date().getMinutes() > mins
        );
      }
      case '60': {
        return currentHour === hourIndex;
      }
    }
  };

  let checkHours = (i: number) => {
    if (hours === 'work') {
      return i + 8;
    }
    return i;
  };

  const weekDates = useMemo(() => {
    let dates = getWeekDates(date);
    if (days === 'work') dates = dates.slice(0, 5);
    return dates;
  }, [date, days, getWeekDates]);

  const timeList = useMemo(() => {
    switch (minutes) {
      case '15': {
        return hours === 'work'
          ? Array.from({ length: 44 }, (_, index) => {
              const hour = Math.floor(index / 4);
              const minutes = (index % 4) * 15;
              return { hour, minutes };
            })
          : Array.from({ length: 96 }, (_, index) => {
              const hour = Math.floor(index / 4);
              const minutes = (index % 4) * 15;
              return { hour, minutes };
            });
      }
      case '30': {
        return hours === 'work'
          ? Array.from({ length: 22 }, (_, index) => {
              const hour = Math.floor(index / 2);
              const minutes = (index % 2) * 30;
              return { hour, minutes };
            })
          : Array.from({ length: 48 }, (_, index) => {
              const hour = Math.floor(index / 2);
              const minutes = (index % 2) * 30;
              return { hour, minutes };
            });
      }
      case '60': {
        return hours === 'work'
          ? Array.from({ length: 11 }, (_, index) => {
              const hour = index;
              const minutes = 0;
              return { hour, minutes };
            })
          : Array.from({ length: 24 }, (_, index) => {
              const hour = index;
              const minutes = 0;
              return { hour, minutes };
            });
      }
      default:
        return hours === 'work'
          ? Array.from({ length: 11 }, (_, index) => {
              const hour = index + 8;
              const minutes = 0;
              return { hour, minutes };
            })
          : Array.from({ length: 24 }, (_, index) => {
              const hour = index;
              const minutes = 0;
              return { hour, minutes };
            });
    }
  }, [hours, minutes]);

  const locale = useMemo(() => {
    if (language === 'fr') return { locale: fr };
    if (language === 'es') return { locale: es };
    if (language === 'de') return { locale: de };
    return {};
  }, [language]);

  const todayLabel = useMemo(() => {
    if (language === 'fr') return "Aujourd'hui";
    if (language === 'es') return 'Hoy';
    if (language === 'de') return 'Heute';
    return 'Today';
  }, [language]);

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="flex flex-col gap-4 h-full">
        <div
          className={`scheduler-navigation flex items-center justify-center gap-2 ${style?.fontSize ? style?.fontSize : 'text-xl'}`}
        >
          <button
            title="Previous year"
            className="nav-button last-year rounded-full p-1 hover:bg-gray-300 duration-300"
            style={{ display: yearNav ? 'block' : 'none' }}
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button
            title="Previous month"
            className="nav-button last-month rounded-full p-1 hover:bg-gray-300 duration-300"
          >
            <MdKeyboardArrowLeft />
          </button>
          <span
            className={`current-month ${style?.fontSize ? style?.fontSize : 'text-xl'} ${style?.fontWeight ? style?.fontWeight : 'font-semibold'} `}
          >
            {format(date, 'MMMM yyyy', locale).charAt(0).toUpperCase() +
              format(date, 'MMMM yyyy', locale).slice(1)}
          </span>
          <button
            title="Next month"
            className="nav-button next-month rounded-full p-1 hover:bg-gray-300 duration-300"
          >
            <MdKeyboardArrowRight />
          </button>
          <button
            title="Next year"
            className="nav-button next-year rounded-full p-1 hover:bg-gray-300 duration-300"
            style={{ display: yearNav ? 'block' : 'none' }}
          >
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>
        <div className="scheduler w-full h-full flex justify-center">
          <table className="table-fixed w-full h-full border-collapse">
            <thead>
              <tr className="scheduler-header-row">
                <th
                  className={`scheduler-header time-column w-24 ${headerPosition === 'sticky' ? 'sticky' : ''} top-0 z-[1] ${style?.backgroundColor ? style?.backgroundColor : 'bg-white'}`}
                >
                  <div className="nav-buttons w-full flex items-center justify-center">
                    <button
                      title="Previous week"
                      className="nav-button last-week p-1 text-2xl rounded-full hover:bg-gray-300 duration-300"
                    >
                      <MdKeyboardArrowLeft />
                    </button>
                    <button
                      className="today-button p-1 rounded-lg hover:bg-gray-300 duration-300"
                      style={{ display: todayButton ? 'block' : 'none' }}
                    >
                      {todayLabel}
                    </button>
                    <button
                      title="Next week"
                      className="nav-button next-week p-1 text-2xl rounded-full hover:bg-gray-300 duration-300"
                    >
                      <MdKeyboardArrowRight />
                    </button>
                  </div>
                  <span className="timezone font-medium text-xs text-gray-400">
                    {format(date, 'OOOO')}
                  </span>
                </th>
                {weekDates.map((day, index) => (
                  <th
                    key={index}
                    className={`scheduler-header ${isEqual(day, firstDayOfWeek) && isEqual(firstHour, checkHours(index)) ? 'w-32' : 'w-24'} ${headerPosition === 'sticky' ? 'sticky' : ''} top-0 z-[1] ${style?.backgroundColor ? style?.backgroundColor : 'bg-white'}`}
                  >
                    <div
                      title={format(day, 'EEEE', locale)}
                      key={index}
                      className="weekday-title flex flex-col items-center font-medium text-center"
                    >
                      <span
                        className="weekday-day text-sm"
                        style={{ color: isToday(day) ? color : '' }}
                      >
                        {format(day, 'EEE', locale).charAt(0).toUpperCase() +
                          format(day, 'EEE', locale).slice(1)}
                      </span>
                      <span
                        className="weekday-number rounded-full text-xl mb-1 h-10 w-10 flex items-center justify-center font-medium"
                        style={{
                          backgroundColor: isToday(day) ? color : '',
                          color: isToday(day) ? 'white' : '',
                        }}
                      >
                        {format(day, 'dd', locale)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="scheduler-body">
              {timeList.map(({ hour, minutes }, hourIndex) => (
                <tr
                  key={`${hour}-${minutes}`}
                  className="w-32"
                  style={{
                    height: height,
                  }}
                >
                  <td className="flex items-center justify-center">
                    <span
                      className={`timeline text-gray-400 ${style?.fontSize ? style?.fontSize : 'text-[12px]'} ${style?.fontWeight ? style?.fontWeight : 'font-semibold'}`}
                      style={{
                        color:
                          isToday(date) && isCurrentHour(checkHours(hour), minutes) ? color : '',
                      }}
                    >
                      {timeFormat === '12'
                        ? format(
                            setMinutes(setHours(new Date(), checkHours(hour)), minutes),
                            'KK:mm a',
                          )
                        : format(
                            setMinutes(setHours(new Date(), checkHours(hour)), minutes),
                            'HH:mm',
                          )}
                    </span>
                  </td>
                  {weekDates.map((day, dayIndex) => (
                    <td
                      key={format(day, 'yyyy-MM-dd') + '-' + dayIndex}
                      className={`time-cell border border-gray-200 p-1 ${isEqual(day, firstDayOfWeek) && isEqual(firstHour, checkHours(hourIndex)) ? 'h-20' : 'h-12'}`}
                      style={{
                        backgroundColor:
                          isToday(day) && isCurrentHour(checkHours(hour), minutes)
                            ? colorToHex(color) + '30'
                            : '',
                        borderTop:
                          isToday(day) && isCurrentHour(checkHours(hour), minutes)
                            ? '3px solid ' + color
                            : '',
                      }}
                    >
                      <div className="time-content flex flex-col flex-wrap w-full h-full gap-1 overflow-x-auto">
                        {isEqual(day, firstDayOfWeek) &&
                        isEqual(firstHour, checkHours(hourIndex)) ? (
                          <div
                            className="event p-1 border-t-4 overflow-y-auto h-full flex flex-col gap-1"
                            style={{
                              backgroundColor: colorToHex(selectedColor) + '50',
                              borderTopColor: colorToHex(selectedColor),
                            }}
                          >
                            <span
                              className={`event-title ${style?.fontWeight ? style?.fontWeight : 'font-medium'}`}
                            >
                              {property ? '{' + property + '}' : 'No Property Set'}
                            </span>
                            <div className="attributes flex flex-wrap">
                              {attributes?.map((attribute, index) => (
                                <span
                                  key={index}
                                  className={`attribute ${style?.fontSize ? style?.fontSize : 'text-sm'} basis-1/2 text-start`}
                                >
                                  {attribute.Attribute}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
