import { splitDatasourceID, useRenderer, useSources, useWebformPath } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState, useMemo, useRef } from 'react';

import {
  isEqual,
  subMonths,
  addMonths,
  format,
  startOfWeek,
  addDays,
  subWeeks,
  addWeeks,
  isToday,
  setHours,
  setMinutes,
} from 'date-fns';
import { colorToHex, generateColorPalette, randomColor } from '../shared/colorUtils';

import { BsFillInfoCircleFill } from 'react-icons/bs';
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';
import { ISchedulerProps } from './Scheduler.config';

import { fr, es, de } from 'date-fns/locale';

const Scheduler: FC<ISchedulerProps> = ({
  todayButton,
  language,
  yearNav,
  minutes,
  hours,
  days,
  height,
  selectedDate,
  property,
  startDate,
  startTime,
  endTime,
  timeFormat,
  color,
  colorProp,
  colors = [],
  attributes = [],
  headerPosition,
  style,
  className,
  classNames = [],
}) => {
  const { connect, emit } = useRenderer();

  const {
    sources: { datasource: ds, currentElement: ce },
  } = useSources();

  const [value, setValue] = useState<any[]>([]);
  const [, setSelectedData] = useState<any>({});
  const [date, setDate] = useState<Date>(new Date());
  const [selDate, setSelDate] = useState(new Date());
  const hasMounted = useRef(false);
  const path = useWebformPath();

  useEffect(() => {
    if (!ds) return;

    const listener = async (/* event */) => {
      const v = await ds.getValue<any>();
      setValue(v);
    };

    listener();

    ds.addListener('changed', listener);

    return () => {
      ds.removeListener('changed', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds, date]);

  useEffect(() => {
    if (hasMounted.current) {
      emit('onWeekChange', { currentDate: date });
    } else {
      hasMounted.current = true;
    }
  }, [date]);

  let attributeList = attributes?.map((e) => e.Attribute);

  const colorgenerated = useMemo(() => {
    return generateColorPalette(value.length, ...colors.map((e) => e.color || randomColor()));
  }, [value.length]);

  const data = useMemo(() => {
    return value.map((obj, index) => ({
      ...obj,
      color: obj[colorProp] || colorgenerated[index],
      attributes: attributeList?.reduce((acc: { [key: string]: any }, e) => {
        acc[e] = obj[e];
        return acc;
      }, {}),
    }));
  }, [value]);

  const checkParams = useMemo(() => {
    if (!ds) {
      return 'Please set "Datasource"';
    } else if (!value[0] || !value.length) {
      return '';
    }

    if (!property) {
      return 'Please set "Property"';
    } else if (!(property in value[0])) {
      return `${property} does not exist as an attribute`;
    }
    if (!startDate) {
      return 'Please set "event date"';
    } else if (!(startDate in value[0])) {
      return `${startDate} does not exist as an attribute`;
    }
    if (!startTime) {
      return 'Please set "start time"';
    } else if (!(startTime in value[0])) {
      return `${startTime} does not exist as an attribute`;
    }
    if (!endTime) {
      return 'Please set "end time"';
    } else if (!(endTime in value[0])) {
      return `${endTime} does not exist as an attribute`;
    }

    return '';
  }, [ds, value, property, startDate, startTime, endTime]);

  const getWeekDates = (startDate: Date) => {
    const dates = [];
    const startOfCurrentWeek = startOfWeek(startDate, { weekStartsOn: 1 });
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

  const isSelected = (date: Date) => {
    return isEqual(date, selDate);
  };

  const goToPreviousWeek = () => setDate(subWeeks(date, 1));

  const goToNextWeek = () => setDate(addWeeks(date, 1));

  const prevMonth = () => setDate(subMonths(date, 1));
  const nextMonth = () => setDate(addMonths(date, 1));
  const nextYear = () => setDate(addMonths(date, 12));
  const prevYear = () => setDate(subMonths(date, 12));

  const handleItemClick = async (value: Object) => {
    if (!ce) return;
    ce.setValue(null, value);
    const selItem = await ce.getValue();
    setSelectedData(selItem);
    emit('onItemClick', { selectedData: selItem });
  };

  const handleDateClick = async (value: Date) => {
    if (!selectedDate) return;
    const { id, namespace } = splitDatasourceID(selectedDate);
    const ds =
      window.DataSource.getSource(id, namespace) || window.DataSource.getSource(selectedDate, path);
    ds?.setValue(null, value);
    const ce = await ds?.getValue();
    setSelDate(ce);
    emit('onDateClick', { selectedDate: ce });
  };

  let checkHours = (i: number) => {
    if (hours === 'work') {
      return i + 8;
    }
    return i;
  };

  const numberMin = useMemo(() => {
    switch (minutes) {
      case '15': {
        return 15;
      }
      case '30': {
        return 30;
      }
      case '60': {
        return 60;
      }
    }
  }, [minutes]);

  const timeToFloat = (hour: number, minutes: number) => {
    const minutesFraction = minutes / 60;
    return hour + minutesFraction;
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

  return !checkParams ? (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="flex flex-col gap-4 h-full">
        <div
          className={`scheduler-navigation flex items-center justify-center gap-2 ${style?.fontSize ? style?.fontSize : 'text-xl'}`}
        >
          <button
            title="Previous Year"
            className="nav-button last-year rounded-full p-1 hover:bg-gray-300 duration-300"
            style={{ display: yearNav ? 'block' : 'none' }}
            onClick={prevYear}
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button
            title="Previous Month"
            className="nav-button last-month rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={prevMonth}
          >
            <MdKeyboardArrowLeft />
          </button>
          <span
            className={`current-month text-center w-44 ${style?.fontSize ? style?.fontSize : 'text-xl'} ${style?.fontWeight ? style?.fontWeight : 'font-semibold'} `}
          >
            {format(date, 'MMMM yyyy', locale).charAt(0).toUpperCase() +
              format(date, 'MMMM yyyy', locale).slice(1)}
          </span>
          <button
            title="Next Month"
            className="nav-button next-month rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={nextMonth}
          >
            <MdKeyboardArrowRight />
          </button>
          <button
            title="Next Year"
            className="nav-button next-year rounded-full p-1 hover:bg-gray-300 duration-300"
            style={{ display: yearNav ? 'block' : 'none' }}
            onClick={nextYear}
          >
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>
        <div className="scheduler w-full h-full flex justify-center">
          <table className="table-fixed w-full h-full border-collapse ">
            <thead>
              <tr className="scheduler-header-row">
                <th
                  className={`scheduler-header time-column w-24 ${headerPosition === 'sticky' ? 'sticky' : ''} top-0 z-[1] ${style?.backgroundColor ? style?.backgroundColor : 'bg-white'}`}
                >
                  <div className="week-navigation w-full flex items-center justify-center">
                    <button
                      title="Previous Week"
                      className="nav-button last-week p-1 text-2xl rounded-full hover:bg-gray-300 duration-300"
                      onClick={goToPreviousWeek}
                    >
                      <MdKeyboardArrowLeft />
                    </button>
                    <button
                      onClick={() => setDate(new Date())}
                      className="today-button p-1 rounded-lg hover:bg-gray-300 duration-300"
                      style={{ display: todayButton ? 'block' : 'none' }}
                    >
                      {todayLabel}
                    </button>
                    <button
                      title="Next Week"
                      className="nav-button next-week p-1 text-2xl rounded-full hover:bg-gray-300 duration-300"
                      onClick={goToNextWeek}
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
                    className={`scheduler-header week-row w-32 ${headerPosition === 'sticky' ? 'sticky' : ''} top-0 z-[1] ${style?.backgroundColor ? style?.backgroundColor : 'bg-white'}`}
                  >
                    <div
                      title={format(day, 'EEEE', locale)}
                      key={index}
                      className="weekday-title flex flex-col items-center font-medium text-center"
                    >
                      <span
                        className="weekday-day text-sm cursor-pointer"
                        style={{
                          color: isToday(day) ? color : '',
                        }}
                      >
                        {format(day, 'EEE', locale).charAt(0).toUpperCase() +
                          format(day, 'EEE', locale).slice(1)}
                      </span>
                      <span
                        className="weekday-number rounded-full text-xl mb-1 h-10 w-10 flex items-center justify-center font-medium cursor-pointer"
                        style={{
                          backgroundColor: isToday(day) ? color : '',
                          border: isSelected(day) ? `2px solid ${colorToHex(color)}` : '',
                          color: isToday(day) ? 'white' : '',
                        }}
                        onClick={() => handleDateClick(day)}
                      >
                        {format(day, 'dd')}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="scheduler-body">
              {timeList.map(({ hour, minutes }, hIndex) => (
                <tr
                  key={checkHours(hIndex)}
                  className="w-36"
                  style={{
                    height: height,
                  }}
                >
                  <td className="flex items-center justify-center">
                    <span
                      className={`timeline text-gray-400 ${style?.fontSize ? style?.fontSize : 'text-[12px]'} ${style?.fontWeight ? style?.fontWeight : 'font-semibold'}`}
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
                  {weekDates.map((day, dayIndex) => {
                    const events = data.filter((event) => {
                      const eventStartTime = timeToFloat(
                        parseInt(event[startTime].split(':')[0]),
                        parseInt(event[startTime].split(':')[1]),
                      );
                      const eventEndTime = timeToFloat(
                        parseInt(event[endTime].split(':')[0]),
                        parseInt(event[endTime].split(':')[1]),
                      );

                      return (
                        (format(new Date(event[startDate]), 'yyyy-MM-dd') ===
                          format(day, 'yyyy-MM-dd') &&
                          timeToFloat(checkHours(hour), minutes) >= eventStartTime &&
                          timeToFloat(checkHours(hour), minutes) <= eventEndTime) ||
                        (format(new Date(event[startDate]), 'yyyy-MM-dd') ===
                          format(day, 'yyyy-MM-dd') &&
                          checkHours(hour) >= parseInt(event[startTime].split(':')[0]) &&
                          minutes <= parseInt(event[startTime].split(':')[1]) &&
                          parseInt(event[startTime].split(':')[1]) <= minutes + numberMin &&
                          checkHours(hour) <= parseInt(event[endTime].split(':')[0]))
                      );
                    });
                    return (
                      <td
                        key={format(day, 'yyyy-MM-dd') + '-' + dayIndex}
                        className="border border-gray-200 p-1"
                        style={{
                          backgroundColor:
                            isToday(day) && isCurrentHour(checkHours(hour), minutes)
                              ? colorToHex(color) + '30'
                              : '',
                          border:
                            isToday(day) && isCurrentHour(checkHours(hour), minutes)
                              ? '2px solid ' + color
                              : '',
                        }}
                      >
                        <div className="time-content flex w-full h-full gap-1 overflow-x-auto">
                          {events.map((event, index) => (
                            <div
                              key={index}
                              className="event px-2 w-full border-t-4 overflow-y-auto h-full flex flex-col gap-1 cursor-pointer"
                              style={{
                                backgroundColor: colorToHex(event.color) + '40',
                                borderTopColor: colorToHex(event.color),
                              }}
                              onClick={() => handleItemClick(event)}
                            >
                              <span
                                className={`event-title ${style?.fontWeight ? style?.fontWeight : 'font-medium'}`}
                                title={event[property]}
                              >
                                {event[property]}
                              </span>
                              <div
                                key={`attributes-${index}`}
                                className="attributes flex flex-wrap"
                              >
                                {attributeList?.map((e) => {
                                  return (
                                    <span
                                      key={`attribute-${index}-${e}`}
                                      className={`attribute ${style?.fontSize ? style?.fontSize : 'text-sm'} basis-1/2 text-start`}
                                      title={event?.attributes[e]?.toString()}
                                    >
                                      {event.attributes[e]}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-red-600 py-4 text-red-700">
      <BsFillInfoCircleFill className=" h-6 w-6" />
      <p className=" font-medium">{checkParams}</p>
    </div>
  );
};

export default Scheduler;
