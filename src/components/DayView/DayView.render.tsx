import { useRenderer, useSources, useWebformPath } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState, useMemo, useRef } from 'react';

import { format, setHours, isToday, setMinutes, isEqual } from 'date-fns';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { colorToHex, generateColorPalette, randomColor } from '../shared/colorUtils';

import { IDayViewProps } from './DayView.config';

import { fr, es, de } from 'date-fns/locale';

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
  hours,
  minutes,
  timeFormat,
  style,
  className,
  classNames = [],
}) => {
  const { connect, emit } = useRenderer();
  const {
    sources: { datasource: ds, currentElement: ce },
  } = useSources();

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
  }, [ds]);

  const [, setSelectedData] = useState<any>({});
  const [value, setValue] = useState<any[]>([]);
  const [date, setDate] = useState(new Date());
  const [selDate, setSelDate] = useState(new Date());
  const hasMounted = useRef(false);
  const path = useWebformPath();

  useEffect(() => {
    if (hasMounted.current) {
      emit('onDayChange', { currentDate: date });
    } else {
      hasMounted.current = true;
    }
  }, [date]);

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

  const handlePrevDay = () => {
    const prevDate = new Date(date);
    prevDate.setDate(date.getDate() - 1);
    setDate(prevDate);
  };

  const handleNextDay = () => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    setDate(nextDate);
  };

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
    if (!eventDate) {
      return 'Please set "event date"';
    } else if (!(eventDate in value[0])) {
      return `${eventDate} does not exist as an attribute`;
    }
    if (!startTime) {
      return 'Please set the "start time"';
    } else if (!(startTime in value[0])) {
      return `${startTime} does not exist as an attribute`;
    }
    if (!endTime) {
      return 'Please set the "end time"';
    } else if (!(endTime in value[0])) {
      return `${endTime} does not exist as an attribute`;
    }

    return '';
  }, [ds, value, property, eventDate, startTime, endTime]);

  const colorgenerated = useMemo(
    () => generateColorPalette(value.length, ...colors.map((e) => e.color || randomColor())),
    [value.length],
  );

  let attributeList = attributes?.map((e) => e.Attribute);

  const data = useMemo(
    () =>
      value.map((obj, index) => ({
        ...obj,
        color: obj[colorProp] || colorgenerated[index],
        attributes: attributeList?.reduce((acc: { [key: string]: any }, e) => {
          acc[e] = obj[e];
          return acc;
        }, {}),
      })),
    [value],
  );

  const handleItemClick = async (value: Object) => {
    if (!ce) return;
    ce.setValue(null, value);
    const selItem = await ce.getValue();
    setSelectedData(selItem);
    emit('onItemClick', { selectedData: selItem });
  };

  const handleDateClick = async (value: Date) => {
    if (!selectedDate) return;
    const ds = window.DataSource.getSource(selectedDate, path);
    ds?.setValue(null, value);
    const ce = await ds?.getValue();
    setSelDate(ce);
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
                    onClick={() => setDate(new Date())}
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
                      className="weekday-number rounded-full text-xl mb-1 h-10 w-10 flex items-center justify-center font-medium"
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
                const eventStartTime = timeToFloat(
                  parseInt(event[startTime].split(':')[0]),
                  parseInt(event[startTime].split(':')[1]),
                );
                const eventEndTime = timeToFloat(
                  parseInt(event[endTime].split(':')[0]),
                  parseInt(event[endTime].split(':')[1]),
                );

                return (
                  (format(new Date(event[eventDate]), 'yyyy-MM-dd') ===
                    format(date, 'yyyy-MM-dd') &&
                    timeToFloat(checkHours(hour), minutes) >= eventStartTime &&
                    timeToFloat(checkHours(hour), minutes) <= eventEndTime) ||
                  (format(new Date(event[eventDate]), 'yyyy-MM-dd') ===
                    format(date, 'yyyy-MM-dd') &&
                    checkHours(hour) >= parseInt(event[startTime].split(':')[0]) &&
                    minutes <= parseInt(event[startTime].split(':')[1]) &&
                    parseInt(event[startTime].split(':')[1]) <= minutes + numberMin &&
                    checkHours(hour) <= parseInt(event[endTime].split(':')[0]))
                );
              });
              return (
                <tr key={checkHours(hourIndex)} className="dayview-row w-36 h-16">
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
                  <td
                    key={format(date, 'yyyy-MM-dd') + '-' + hourIndex}
                    className="border border-gray-200 p-1"
                    style={{
                      backgroundColor:
                        isToday(date) && isCurrentHour(checkHours(hour), minutes)
                          ? colorToHex(color) + '30'
                          : '',
                      border:
                        isToday(date) && isCurrentHour(checkHours(hour), minutes)
                          ? '2px solid ' + color
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
                            backgroundColor: colorToHex(event.color) + '40',
                            borderTopColor: colorToHex(event.color),
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
