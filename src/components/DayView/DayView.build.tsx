import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useMemo } from 'react';

import { IDayViewProps } from './DayView.config';

import { format, setHours, isToday, isEqual } from 'date-fns';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { colorToHex } from '../shared/colorUtils';

import { fr, es, de } from 'date-fns/locale';
import { TinyColor } from '@ctrl/tinycolor';

const DayView: FC<IDayViewProps> = ({
  property,
  language,
  todayButton,
  headerPosition,
  color,
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
                <div className="nav-buttons flex items-center justify-center ">
                  <button className="nav-button p-1 text-2xl rounded-full hover:bg-gray-300 duration-300">
                    <MdKeyboardArrowLeft />
                  </button>
                  <button
                    className="today-button p-1 rounded-lg hover:bg-gray-300 duration-300"
                    style={{ display: todayButton ? 'block' : 'none' }}
                  >
                    {todayLabel}
                  </button>
                  <button className="nav-button p-1 text-2xl rounded-full hover:bg-gray-300 duration-300">
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
            {hourList.map((_, hourIndex) => (
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
                  <div className="time-content flex flex-col flex-wrap w-1/3 h-full gap-1 overflow-x-auto">
                    {isToday(date) && isEqual(firstHour, checkHours(hourIndex)) ? (
                      <div
                        className="event p-1 border-t-4 overflow-y-auto h-full flex flex-col gap-1"
                        style={{
                          backgroundColor: new TinyColor('#C084FC').toHexString() + '50',
                          borderTopColor: new TinyColor('#C084FC').toHexString(),
                        }}
                      >
                        <span
                          className={`event-title ${style?.fontWeight ? style?.fontWeight : 'font-medium'}`}
                        >
                          {property ? '{' + property + '}' : 'No Property Set'}
                        </span>
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
