import { useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState } from 'react';

import { format, setHours, isToday } from 'date-fns';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { colorToHex, generateColorPalette, randomColor } from '../shared/colorUtils';

import { IDayViewProps } from './DayView.config';

const DayView: FC<IDayViewProps> = ({
  todayButton,
  colors = [],
  property,
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
  const { connect } = useRenderer();
  const {
    sources: { datasource: ds },
  } = useSources();

  const [value, setValue] = useState<any[]>([]);

  const [date, setDate] = useState(new Date());

  const isCurrentHour = (hourIndex: number) => {
    return date.getHours() === hourIndex;
  };

  let hourList = Array.from({ length: 24 });

  let checkHours = (i: number) => {
    if (hours === 'work') {
      return i + 8;
    }
    return i;
  };

  if (hours === 'work') {
    hourList = Array.from({ length: 11 }, (_, index) => index + 8);
  }

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

  const colorgenerated = generateColorPalette(
    value.length,
    ...colors.map((e) => e.color || randomColor()),
  );

  let data = value.map((obj, index) => ({
    ...obj,
    color: colorgenerated[index],
  }));

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="current-day text-center text-xl font-medium">
        {format(date, 'dd MMMM yyyy')}
      </div>
      <div className="day-view-container w-full h-full">
        <table className="table-fixed w-full h-full border-collapse">
          <thead>
            <tr className="day-view-header">
              <th className="w-32 top-0 z-[1] bg-white">
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
                    Today
                  </button>
                  <button
                    onClick={handleNextDay}
                    className="nav-button p-1 text-2xl rounded-full hover:bg-gray-300 duration-300"
                  >
                    <MdKeyboardArrowRight />
                  </button>
                </div>
                <span className="current-month font-medium text-xs text-gray-400">
                  {format(date, 'OOOO')}
                </span>
              </th>
              <th className="w-full top-0 z-[1] bg-white">
                <div className="weekday-title ml-4 flex flex-col items-start justify-center font-medium">
                  <span>
                    <span
                      className="weekday-day text-sm"
                      style={{ color: isToday(date) ? color : '' }}
                    >
                      {format(date, 'EEE')}
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
              const event = data.filter((event) => {
                const eventStartTime = parseInt(event[startTime].split(':')[0]);
                const eventEndTime = parseInt(event[endTime].split(':')[0]);
                return (
                  event[eventDate] === format(date, 'yyyy-MM-dd') &&
                  checkHours(hourIndex) >= eventStartTime &&
                  checkHours(hourIndex) < eventEndTime
                );
              });
              return (
                <tr key={checkHours(hourIndex)} className="w-36 h-16">
                  <td className="flex items-center justify-center">
                    <span className="timeline text-gray-400 text-[12px] font-semibold">
                      {timeFormat === '12'
                        ? format(setHours(new Date(), checkHours(hourIndex)), 'K a')
                        : format(setHours(new Date(), checkHours(hourIndex)), 'HH:00')}
                    </span>
                  </td>
                  <td
                    key={format(date, 'yyyy-MM-dd') + '-' + hourIndex}
                    className="time-content border border-gray-200"
                    style={{
                      backgroundColor:
                        isToday(date) && isCurrentHour(checkHours(hourIndex))
                          ? colorToHex(color) + '30'
                          : '',
                    }}
                  >
                    <div className="flex flex-col flex-wrap w-full h-full gap-1 overflow-x-auto">
                      {event.map((event, index) => (
                        <div
                          title={event[property]}
                          key={index}
                          className="event p-1 border-t-4 overflow-y-auto h-full flex flex-col gap-1"
                          style={{
                            backgroundColor: event.color + '40',
                            borderTopColor: event.color,
                          }}
                        >
                          <span className="event-title text-base font-medium">
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
  );
};

export default DayView;
