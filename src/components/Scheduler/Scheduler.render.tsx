import {
  dateTo4DFormat,
  isLocalArrayDataSource,
  splitDatasourceID,
  unsubscribeFromDatasource,
  useDataLoader,
  useRenderer,
  useSources,
  useWebformPath,
} from '@ws-ui/webform-editor';
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
  endOfWeek,
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

import findIndex from 'lodash/findIndex';

import { fr, es, de } from 'date-fns/locale';
import { updateEntity } from '../hooks/useDsChangeHandler';
import Spinner from '../shared/Spinner';

const Scheduler: FC<ISchedulerProps> = ({
  todayButton,
  language,
  weekStart,
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
  selectedColor,
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
    sources: { datasource, currentElement: ce },
  } = useSources();

  let { entities, fetchIndex, setStep, query, loaderDatasource } = useDataLoader({
    source: datasource,
  });

  const [date, setDate] = useState<Date>(new Date());
  const [selDate, setSelDate] = useState(new Date());
  const [selEvent, setSelEvent] = useState<any>(null);
  const hasMounted = useRef(false);
  const path = useWebformPath();
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState<any[]>([]);

  const startOfWeekInt = parseInt(weekStart, 10) as 0 | 1;

  const attrs = useMemo(
    () =>
      datasource?.type === 'entitysel'
        ? datasource.filterAttributesText?.split(',')
        : isLocalArrayDataSource(datasource)
          ? Object.keys((datasource as any).value[0] || {})
          : [],
    [datasource],
  );

  function convertMilliseconds(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;

    return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  let attributeList = attributes?.map((e) => e.Attribute);

  const { id: propertyId } = splitDatasourceID(property);
  property = propertyId;
  const { id: startDateId } = splitDatasourceID(startDate);
  startDate = startDateId;
  const { id: startTimeId } = splitDatasourceID(startTime);
  startTime = startTimeId;
  const { id: endTimeId } = splitDatasourceID(endTime);
  endTime = endTimeId;
  const { id: colorPropId } = splitDatasourceID(colorProp);
  colorProp = colorPropId;
  for (let index = 0; index < attributeList.length; index++) {
    const { id: attributeId } = splitDatasourceID(attributeList[index]);
    attributeList[index] = attributeId;
  }

  const weekQuery = async (source: datasources.DataSource, date: Date) => {
    setLoading(true);
    if (!source) return;
    if (source.type === 'entitysel') {
      if (attrs?.includes(startDate.split('.')[0])) {
        const startOfWeekDate = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const endOfWeekDate = format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');

        const queryStr = `${startDate} >= :1 AND ${startDate} <= :2`;
        const placeholders = [startOfWeekDate, endOfWeekDate];

        query.entitysel({
          queryString: queryStr,
          placeholders,
        });
      } else {
        checkParams = `"${startDate}" does not exist as an attribute`;
      }
    } else if (source.dataType === 'array') {
      setValue(await source.getValue());
    }
    setLoading(false);
  };
  let checkParams = useMemo(() => {
    if (!datasource) {
      return 'Please set "Datasource"';
    } else if (!entities[0] || !entities.length) {
      return '';
    }

    if (!property) {
      return 'Please set "Property"';
    } else if (!attrs?.includes(property)) {
      return `${property} does not exist as an attribute`;
    }
    if (!startDate) {
      return 'Please set "event date"';
    } else if (!attrs?.includes(startDate)) {
      return `${startDate} does not exist as an attribute`;
    }
    if (!startTime) {
      return 'Please set "start time"';
    } else if (!attrs?.includes(startTime)) {
      return `${startTime} does not exist as an attribute`;
    }
    if (!endTime) {
      return 'Please set "end time"';
    } else if (!attrs?.includes(endTime)) {
      return `${endTime} does not exist as an attribute`;
    }

    return '';
  }, [datasource, entities]);

  // * Prevent onWeekChange from executing from the get-Go
  useEffect(() => {
    if (hasMounted.current) {
      emit('onWeekChange', { currentDate: date });
    } else {
      hasMounted.current = true;
    }
  }, [date]);

  useEffect(() => {
    if (!datasource || (datasource.type == 'entitysel' && !(datasource as any).entitysel)) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      weekQuery(loaderDatasource, date);
    };

    fetch();
  }, []);

  useEffect(() => {
    if (!datasource) return;
    const cb = () => {
      weekQuery(loaderDatasource, date);
    };
    datasource.addListener('changed', cb);
    return () => {
      unsubscribeFromDatasource(datasource, cb);
    };
  }, [datasource, date, loaderDatasource, (datasource as any).entitysel]);

  useEffect(() => {
    const fetchData = async () => {
      let selLength = await loaderDatasource.getValue('length');
      setStep({ start: 0, end: selLength });
      await fetchIndex(0);
    };

    fetchData();
  }, [loaderDatasource]);

  const colorgenerated = useMemo(() => {
    return generateColorPalette(entities.length, ...colors.map((e) => e.color || randomColor()));
  }, [entities.length]);

  const data = useMemo(() => {
    return (datasource.dataType === 'array' ? value : entities).map((obj: any, index) => ({
      ...obj,
      color: obj[colorProp] || colorgenerated[index],
      attributes: attributeList?.reduce((acc: { [key: string]: any }, e) => {
        acc[e] = obj[e];
        return acc;
      }, {}),
    }));
  }, [entities, colorgenerated, colorProp, attributeList]);

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

  const isSelectedDate = (date: Date) => {
    return isEqual(date, selDate);
  };

  const isSelectedEvent = (event: any) => {
    return (
      (event[property] === selEvent?.[property] &&
        event[startDate] === selEvent?.[startDate] &&
        event[startTime] === selEvent?.[startTime] &&
        event[endTime] === selEvent?.[endTime]) ||
      false
    );
  };

  const todayButt = () => {
    weekQuery(datasource, new Date());
    setDate(new Date());
  };

  const goToPreviousWeek = () => {
    weekQuery(datasource, subWeeks(date, 1));
    setDate(subWeeks(date, 1));
  };

  const goToNextWeek = () => {
    weekQuery(datasource, addWeeks(date, 1));
    setDate(addWeeks(date, 1));
  };

  const prevMonth = () => {
    weekQuery(datasource, subMonths(date, 1));
    setDate(subMonths(date, 1));
  };
  const nextMonth = () => {
    weekQuery(datasource, addMonths(date, 1));
    setDate(addMonths(date, 1));
  };
  const nextYear = () => {
    weekQuery(datasource, addMonths(date, 12));
    setDate(addMonths(date, 12));
  };
  const prevYear = () => {
    weekQuery(datasource, subMonths(date, 12));
    setDate(subMonths(date, 12));
  };

  const handleItemClick = async (item: { [key: string]: any }) => {
    setSelEvent(item);
    if (!ce) return;
    switch (ce.type) {
      case 'scalar':
        ce.setValue(null, item);
        emit('onItemClick', { selectedData: ce });
        break;
      case 'entity':
        const index = findIndex(
          entities,
          (e: any) =>
            e[property] === item[property] &&
            e[startDate] === item[startDate] &&
            e[startTime] === item[startTime] &&
            e[endTime] === item[endTime],
        );
        await updateEntity({ index, datasource: loaderDatasource, currentElement: ce });
        emit('onItemClick', { selectedData: ce });
        break;
    }
  };

  const handleDateClick = async (value: Date) => {
    setSelDate(value);
    if (!selectedDate) return;
    const { id, namespace } = splitDatasourceID(selectedDate);
    const ds =
      window.DataSource.getSource(id, namespace) || window.DataSource.getSource(selectedDate, path);
    ds?.setValue(
      null,
      value instanceof Date && !isNaN(value.valueOf()) ? dateTo4DFormat(value) : value,
    );
    const ce = await ds?.getValue();
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
        return 0.25;
      }
      case '30': {
        return 0.5;
      }
      case '60': {
        return 1;
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
      {loading && <Spinner />}
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
                      onClick={todayButt}
                      className="today-button p-1 rounded-lg hover:bg-gray-300 duration-300"
                      style={{
                        display: todayButton ? 'block' : 'none',
                      }}
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
                          border: isSelectedDate(day) ? `2px solid ${colorToHex(color)}` : '',
                          backgroundColor: isToday(day) ? color : '',
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
                  {weekDates.map((day, dayIndex) => {
                    const events = data.filter((event) => {
                      const eventStartHour =
                        datasource.type === 'scalar'
                          ? parseInt(event[startTime].split(':')[0])
                          : parseInt(convertMilliseconds(event[startTime]).split(':')[0]);
                      const eventStartMinutes =
                        datasource.type === 'scalar'
                          ? parseInt(event[startTime].split(':')[1])
                          : parseInt(convertMilliseconds(event[startTime]).split(':')[1]);
                      const eventEndHour =
                        datasource.type === 'scalar'
                          ? parseInt(event[endTime].split(':')[0])
                          : parseInt(convertMilliseconds(event[endTime]).split(':')[0]);
                      const eventEndMinutes =
                        datasource.type === 'scalar'
                          ? parseInt(event[endTime].split(':')[1])
                          : parseInt(convertMilliseconds(event[endTime]).split(':')[1]);

                      const eventStartTime = timeToFloat(eventStartHour, eventStartMinutes);
                      const eventEndTime = timeToFloat(eventEndHour, eventEndMinutes);
                      return (
                        format(new Date(event[startDate]), 'yyyy-MM-dd') ===
                          format(day, 'yyyy-MM-dd') &&
                        timeToFloat(checkHours(hour), minutes) > eventStartTime - numberMin &&
                        timeToFloat(checkHours(hour), minutes) <= eventEndTime
                      );
                    });
                    return (
                      <td
                        key={format(day, 'yyyy-MM-dd') + '-' + dayIndex}
                        className="time-cell border border-gray-200"
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
                        <div className="time-content flex flex-col flex-wrap w-full h-full gap-0.5 overflow-auto">
                          {events.map((event, index) => (
                            <div
                              key={index}
                              className={`event px-2 border-t-4 overflow-y-auto h-full flex flex-col gap-1 cursor-pointer z-10`}
                              style={{
                                backgroundColor: isSelectedEvent(event)
                                  ? colorToHex(selectedColor) + '70'
                                  : colorToHex(event.color) + '30',
                                borderTopColor: isSelectedEvent(event)
                                  ? colorToHex(selectedColor)
                                  : colorToHex(event.color),
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
