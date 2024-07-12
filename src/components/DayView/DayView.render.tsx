import { useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState, useMemo } from 'react';

import { format, setHours, isToday } from 'date-fns';
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
  property,
  headerPosition,
  eventDate,
  startTime,
  endTime,
  color,
  hours,
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

  const isCurrentHour = (hourIndex: number) => {
    return date.getHours() === hourIndex;
  };

  const hourList = useMemo(() => {
    return hours === 'work'
      ? Array.from({ length: 11 }, (_, index) => index + 8)
      : Array.from({ length: 24 });
  }, [hours]);

  let checkHours = (i: number) => {
    if (hours === 'work') {
      return i + 8;
    }
    return i;
  };

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
    [value.length, colors],
  );

  const data = useMemo(
    () => value.map((obj, index) => ({ ...obj, color: obj[colorProp] || colorgenerated[index] })),
    [value],
  );

  const handleItemClick = async (value: Object) => {
    ce.setValue(null, value);
    const selItem = await ce.getValue();
    setSelectedData(selItem);
    emit('onItemClick');
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
      <div className="dayview-container w-full h-full">
        <table className="table-fixed w-full h-full border-collapse">
          <thead>
            <tr className="dayview-header">
              <th
                className={`w-40 ${headerPosition === 'sticky' ? 'sticky' : ''} top-0 z-[1] bg-white`}
              >
                <div className="nav-buttons w-full flex items-center justify-center">
                  <button
                    onClick={handlePrevDay}
                    className="nav-button p-1 text-2xl rounded-full hover:bg-gray-300 duration-300"
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
                    onClick={handleNextDay}
                    className="nav-button p-1 text-2xl rounded-full hover:bg-gray-300 duration-300"
                  >
                    <MdKeyboardArrowRight />
                  </button>
                </div>
                <span className="timezone font-medium text-xs text-gray-400">
                  {format(date, 'OOOO')}
                </span>
              </th>
              <th
                className={`w-full ${headerPosition === 'sticky' ? 'sticky' : ''} top-0 z-[1] bg-white`}
              >
                <div className="weekday-title ml-4 flex flex-col items-start justify-center font-medium">
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
                        color: isToday(date) ? 'white' : '',
                      }}
                    >
                      {format(date, 'dd')}
                    </span>
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {hourList.map((_, hourIndex) => {
              const events = data.filter((event) => {
                const eventStartTime = parseInt(event[startTime].split(':')[0]);
                const eventEndTime = parseInt(event[endTime].split(':')[0]);
                return (
                  format(new Date(event[eventDate]), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
                  checkHours(hourIndex) >= eventStartTime &&
                  checkHours(hourIndex) <= eventEndTime
                );
              });
              return (
                <tr key={checkHours(hourIndex)} className="w-36 h-16">
                  <td className="flex items-center justify-center">
                    <span
                      className={`timeline text-gray-400 ${style?.fontSize ? style?.fontSize : 'text-[12px]'} ${style?.fontWeight ? style?.fontWeight : 'font-semibold'}`}
                    >
                      {timeFormat === '12'
                        ? format(setHours(new Date(), checkHours(hourIndex)), 'K a')
                        : format(setHours(new Date(), checkHours(hourIndex)), 'HH:00')}
                    </span>
                  </td>
                  <td
                    key={format(date, 'yyyy-MM-dd') + '-' + hourIndex}
                    className="border border-gray-200 p-1"
                    style={{
                      backgroundColor:
                        isToday(date) && isCurrentHour(checkHours(hourIndex))
                          ? colorToHex(color) + '30'
                          : '',
                      borderLeft:
                        isToday(date) && isCurrentHour(checkHours(hourIndex))
                          ? '6px solid ' + color
                          : '',
                    }}
                  >
                    <div className="time-content flex flex-col flex-wrap w-full h-full gap-1 overflow-x-auto">
                      {events.map((event, index) => (
                        <div
                          title={event[property]}
                          key={index}
                          className="event p-1 border-t-4 overflow-y-auto h-full flex flex-col gap-1 cursor-pointer"
                          style={{
                            backgroundColor: event.color + '40',
                            borderTopColor: event.color,
                          }}
                          onClick={() => handleItemClick(event)}
                        >
                          <span
                            className={`event-title ${style?.fontWeight ? style?.fontWeight : 'font-medium'}`}
                          >
                            {event[property]}
                          </span>
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
