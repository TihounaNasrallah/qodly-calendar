import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useMemo } from 'react';

import { IDayViewProps } from './DayView.config';

import { format, setHours, isToday, isEqual, setMinutes } from 'date-fns';

import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';

import { colorToHex } from '../shared/colorUtils';

import { fr, es, de } from 'date-fns/locale';

const DayView: FC<IDayViewProps> = ({
  attributes = [],
  minutes,
  property,
  language,
  todayButton,
  headerPosition,
  color,
  selectedColor,
  hours,
  timeFormat,
  style,
  className,
  classNames = [],
}) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

  const date = new Date();

  const firstHour = useMemo(() => {
    if (hours === 'work') {
      return 8;
    }
    return 0;
  }, [hours]);

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

  let checkHours = (i: number) => {
    if (hours === 'work') {
      return i + 8;
    }
    return i;
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
  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div
        className={`dayview-header current-day text-center ${style?.fontSize ? style?.fontSize : 'text-xl'} ${style?.fontWeight ? style?.fontWeight : 'font-semibold'}`}
      >
        {format(date, 'dd MMMM yyyy', locale)}
      </div>
      <div className="dayview w-full h-full">
        <table className="table-fixed w-full h-full border-collapse">
          <thead className="dayview-header">
            <tr>
              <th
                className={`w-40 ${headerPosition === 'sticky' ? 'sticky' : ''} top-0 z-[1] ${style?.backgroundColor ? style?.backgroundColor : 'bg-white'}`}
              >
                <div className="navigation flex items-center justify-center ">
                  <button
                    title="Previous Day"
                    className="nav-button last-day p-1 text-2xl rounded-full hover:bg-gray-300 duration-300"
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
                    title="Next Day"
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
          <tbody className="dayview-body">
            {timeList.map(({ hour, minutes }, hourIndex) => (
              <tr
                key={`${hour}-${minutes}`}
                className={`dayview-row ${isEqual(firstHour, checkHours(hourIndex)) ? 'h-20' : 'h-14'}`}
              >
                <td className="flex items-center justify-center">
                  <span
                    className={`timeline text-gray-400 ${style?.fontSize ? style?.fontSize : 'text-[12px]'} ${style?.fontWeight ? style?.fontWeight : 'font-semibold'}`}
                    style={{
                      color: isToday(date) && isCurrentHour(checkHours(hour), minutes) ? color : '',
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
                  <div className="time-content flex flex-col flex-wrap w-1/3 h-full gap-1 overflow-x-auto">
                    {isToday(date) && isEqual(firstHour, checkHours(hourIndex)) ? (
                      <div
                        className="event p-2 border-t-4 overflow-y-auto h-full flex flex-col gap-1"
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DayView;
