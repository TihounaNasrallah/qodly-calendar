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

import { format, setHours, isToday, setMinutes, isEqual, subDays, addDays } from 'date-fns';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { colorToHex, generateColorPalette, randomColor } from '../shared/colorUtils';

import findIndex from 'lodash/findIndex';

import { IDayViewProps } from './DayView.config';

import { fr, es, de } from 'date-fns/locale';
import { updateEntity } from '../hooks/useDsChangeHandler';
import Spinner from '../shared/Spinner';

const DayView: FC<IDayViewProps> = ({
  language,
  todayButton,
  colorProp,
  colors = [],
  attributes = [],
  selectedDate,
  property,
  headerPosition,
  eventDate,
  startTime,
  endTime,
  color,
  selectedColor,
  hours,
  minutes,
  timeFormat,
  style,
  className,
  classNames = [],
}) => {
  const { connect, emit } = useRenderer();
  const {
    sources: { datasource, currentElement: ce },
  } = useSources();

  const [date, setDate] = useState<Date>(new Date());
  const [selDate, setSelDate] = useState(new Date());
  const [selEvent, setSelEvent] = useState<any>(null);
  const hasMounted = useRef(false);
  const path = useWebformPath();
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState<any[]>([]);

  const attrs = useMemo(
    () =>
      datasource?.type === 'entitysel'
        ? Object.keys(datasource.dataclass)
        : isLocalArrayDataSource(datasource)
          ? Object.keys((datasource as any).value[0])
          : [],
    [datasource],
  );

  let { entities, fetchIndex, setStep } = useDataLoader({ source: datasource });

  function convertMilliseconds(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;

    return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  const dayQuery = async (source: datasources.DataSource, date: Date) => {
    setLoading(true);
    if (!source) return;
    if (source.type === 'entitysel') {
      if (attrs.includes(eventDate.split('.')[0])) {
        const { entitysel } = source as any;
        const queryStr = `${eventDate} == ${format(date, 'yyyy-MM-dd')}`;
        const _settings = source.buildSelectionSettings();
        (source as any).entitysel = source.dataclass.query(queryStr, {
          ..._settings,
          filterAttributes: source.filterAttributesText || entitysel._private.filterAttributes,
        });
        let selLength = await source.getValue('length');
        setStep({ start: 0, end: selLength });
        await fetchIndex(0);
      } else {
        checkParams = `${eventDate} does not exist as an attribute`;
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
    } else if (!attrs.includes(property)) {
      return `${property} does not exist as an attribute`;
    }
    if (!eventDate) {
      return 'Please set "event date"';
    } else if (!attrs.includes(eventDate)) {
      return `${eventDate} does not exist as an attribute`;
    }
    if (!startTime) {
      return 'Please set the "start time"';
    } else if (!attrs.includes(startTime)) {
      return `${startTime} does not exist as an attribute`;
    }
    if (!endTime) {
      return 'Please set the "end time"';
    } else if (!attrs.includes(endTime)) {
      return `${endTime} does not exist as an attribute`;
    }

    return '';
  }, [entities, property]);

  // * Prevent onDayChange from executing from the get-Go
  useEffect(() => {
    if (hasMounted.current) {
      emit('onDayChange', { currentDate: date });
    } else {
      hasMounted.current = true;
    }
  }, [date]);

  useEffect(() => {
    if (!datasource) return;

    const fetch = async () => {
      await fetchIndex(0);
      dayQuery(datasource, date);
    };

    fetch();
  }, []);

  useEffect(() => {
    if (!datasource) return;
    const cb = () => {
      dayQuery(datasource, date);
    };
    datasource.addListener('changed', cb);
    return () => {
      unsubscribeFromDatasource(datasource, cb);
    };
  }, [datasource, date]);

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

  const isSelectedEvent = (event: any) => {
    return (
      (event[property] === selEvent?.[property] &&
        event[eventDate] === selEvent?.[eventDate] &&
        event[startTime] === selEvent?.[startTime] &&
        event[endTime] === selEvent?.[endTime]) ||
      false
    );
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

  const todayButt = () => {
    dayQuery(datasource, new Date());
    setDate(new Date());
  };

  const handlePrevDay = () => {
    dayQuery(datasource, subDays(date, 1));
    setDate(subDays(date, 1));
  };

  const handleNextDay = () => {
    dayQuery(datasource, addDays(date, 1));
    setDate(addDays(date, 1));
  };

  const colorgenerated = useMemo(
    () => generateColorPalette(entities.length, ...colors.map((e) => e.color || randomColor())),
    [entities.length],
  );

  let attributeList = attributes?.map((e) => e.Attribute);

  const data = useMemo(
    () =>
      (datasource.dataType === 'array' ? value : entities).map((obj: any, index) => ({
        ...obj,
        color: obj[colorProp] || colorgenerated[index],
        attributes: attributeList?.reduce((acc: { [key: string]: any }, e) => {
          acc[e] = obj[e];
          return acc;
        }, {}),
      })),
    [entities],
  );

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
            e[eventDate] === item[eventDate] &&
            e[startTime] === item[startTime] &&
            e[endTime] === item[endTime],
        );
        await updateEntity({ index, datasource, currentElement: ce });
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
      <div
        className={`current-day text-center ${style?.fontSize ? style?.fontSize : 'text-xl'} ${style?.fontWeight ? style?.fontWeight : 'font-semibold'}`}
      >
        {format(date, 'dd MMMM yyyy', locale)}
      </div>
      <div className="dayview w-full h-full">
        <table className="table-fixed w-full h-full border-collapse">
          <thead>
            <tr className="dayview-header">
              <th
                className={`w-40 ${headerPosition === 'sticky' ? 'sticky' : ''} top-0 z-[1] ${style?.backgroundColor ? style?.backgroundColor : 'bg-white'}`}
              >
                <div className="navigation w-full flex items-center justify-center">
                  <button
                    title="Previous Day"
                    onClick={handlePrevDay}
                    className="nav-button last-day p-1 text-2xl rounded-full hover:bg-gray-300 duration-300"
                  >
                    <MdKeyboardArrowLeft />
                  </button>
                  <button
                    onClick={todayButt}
                    className="today-button p-1 rounded-lg hover:bg-gray-300 duration-300"
                    style={{ display: todayButton ? 'block' : 'none' }}
                  >
                    {todayLabel}
                  </button>
                  <button
                    title="Next Day"
                    onClick={handleNextDay}
                    className="nav-button next-day p-1 text-2xl rounded-full hover:bg-gray-300 duration-300"
                  >
                    <MdKeyboardArrowRight />
                  </button>
                </div>
                <span className="timezone font-medium text-xs text-gray-400">
                  {format(date, 'OOOO')}
                </span>
              </th>
              <th
                className={`w-full ${headerPosition === 'sticky' ? 'sticky' : ''} top-0 z-[1] ${style?.backgroundColor ? style?.backgroundColor : 'bg-white'}`}
              >
                <div
                  title={format(date, 'EEEE dd MMMM yyyy', locale)}
                  className="weekday-title ml-4 flex flex-col items-start justify-center font-medium"
                >
                  <span>
                    <span
                      className="weekday-day text-sm"
                      style={{ color: isToday(date) ? color : '' }}
                    >
                      {format(date, 'EEE', locale).charAt(0).toUpperCase() +
                        format(date, 'EEE', locale).slice(1)}
                    </span>
                    <span
                      className="weekday-number rounded-full text-xl mb-1 h-10 w-10 flex items-center justify-center font-medium cursor-pointer"
                      style={{
                        backgroundColor: isToday(date) ? color : '',
                        border: isSelected(date) ? `2px solid ${colorToHex(color)}` : '',
                        color: isToday(date) ? 'white' : '',
                      }}
                      onClick={() => handleDateClick(date)}
                    >
                      {format(date, 'dd')}
                    </span>
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="dayview-body">
            {timeList.map(({ hour, minutes }, hourIndex) => {
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
                  format(new Date(event[eventDate]), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
                  timeToFloat(checkHours(hour), minutes) > eventStartTime - numberMin &&
                  timeToFloat(checkHours(hour), minutes) <= eventEndTime
                );
              });
              return (
                <tr key={checkHours(hourIndex)} className="dayview-row w-36 h-16">
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
                  <td
                    key={format(date, 'yyyy-MM-dd') + '-' + hourIndex}
                    className="time-cell border border-gray-200 p-1"
                    style={{
                      backgroundColor:
                        isToday(date) && isCurrentHour(checkHours(hour), minutes)
                          ? colorToHex(color) + '30'
                          : '',
                      borderLeft:
                        isToday(date) && isCurrentHour(checkHours(hour), minutes)
                          ? '5px solid ' + color
                          : '',
                    }}
                  >
                    <div className="time-content flex flex-col flex-wrap w-full h-full gap-1 overflow-x-auto">
                      {events.map((event, index) => (
                        <div
                          title={event[property]}
                          key={index}
                          className="event px-2 border-t-4 overflow-y-auto h-full flex flex-col gap-1 cursor-pointer"
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
                          >
                            {event[property]}
                          </span>
                          <div key={`attributes-${index}`} className="attributes flex flex-wrap">
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <div className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-red-600 py-4 text-red-700">
      <BsFillInfoCircleFill className=" h-6 w-6" />
      <p className=" font-medium">{checkParams}</p>
    </div>
  );
};

export default DayView;
