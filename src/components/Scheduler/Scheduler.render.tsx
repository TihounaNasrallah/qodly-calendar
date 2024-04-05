import { useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState } from 'react';

import { generateColorPalette, randomColor } from '../shared/colorUtils';

import { format, startOfWeek, addDays, subWeeks, addWeeks, isToday, setHours } from 'date-fns';
import { colorToHex } from '../shared/colorUtils';

import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';

import { ISchedulerProps } from './Scheduler.config';

const Scheduler: FC<ISchedulerProps> = ({
  hours,
  fontSize,
  height,
  property,
  startDate,
  startTime,
  endTime,
  timeFormat,
  color,
  colors = [],
  headerPosition,
  style,
  className,
  classNames = [],
}) => {
  const { connect } = useRenderer();

  const {
    sources: { datasource: ds },
  } = useSources();

  const [value, setValue] = useState<any[]>([]);

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

  const [date, setDate] = useState<Date>(new Date());

  const getWeekDates = (startDate: Date) => {
    const dates = [];
    const startOfCurrentWeek = startOfWeek(startDate, { weekStartsOn: 1 }); // Get the start of the current week
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startOfCurrentWeek, i)); // Add days to get the dates of the week
    }
    return dates;
  };

  const isCurrentHour = (hourIndex: number) => {
    const currentHour = new Date().getHours();
    return currentHour === hourIndex;
  };

  const weekDates = getWeekDates(date);

  const goToPreviousWeek = () => {
    setDate(subWeeks(date, 1));
  };

  const goToNextWeek = () => {
    setDate(addWeeks(date, 1));
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
  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="scheduler-container flex flex-col gap-4 h-full">
        <div className="flex items-center justify-center gap-2">
          <span className="current-month text-xl font-medium">{format(date, 'MMMM yyyy')}</span>
        </div>
        <div className="scheduler-grid w-full h-full flex justify-center">
          <table className="table-fixed w-full h-full border-collapse ">
            <thead>
              <tr>
                <th
                  className={`scheduler-header w-16 ${headerPosition === 'sticky' ? 'sticky' : ''} top-0 z-[1] bg-white`}
                >
                  <button
                    className="nav-button p-1 text-2xl rounded-full hover:bg-gray-300 duration-300"
                    onClick={goToPreviousWeek}
                  >
                    <MdKeyboardArrowLeft />
                  </button>
                  <button
                    className="nav-button p-1 text-2xl rounded-full hover:bg-gray-300 duration-300"
                    onClick={goToNextWeek}
                  >
                    <MdKeyboardArrowRight />
                  </button>
                </th>
                {weekDates.map((day, index) => (
                  <th
                    key={index}
                    className={`scheduler-header w-32 ${headerPosition === 'sticky' ? 'sticky' : ''} top-0 z-[1] bg-white`}
                  >
                    <div
                      key={index}
                      className="weekday-title flex flex-col items-center font-medium text-center"
                    >
                      <span
                        className="weekday-day text-sm"
                        style={{ color: isToday(day) ? color : '' }}
                      >
                        {format(day, 'EEE')}
                      </span>
                      <span
                        className="weekday-number rounded-full text-xl mb-1 h-10 w-10 flex items-center justify-center font-medium"
                        style={{
                          backgroundColor: isToday(day) ? color : '',
                          color: isToday(day) ? 'white' : '',
                        }}
                      >
                        {format(day, 'dd')}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="scheduler-body">
              {hourList.map((_, hourIndex) => (
                <tr
                  key={checkHours(hourIndex)}
                  className="w-36"
                  style={{
                    height: height,
                  }}
                >
                  <td className="timeline flex items-center justify-center">
                    <span className=" text-gray-400 text-[12px] font-semibold">
                      {timeFormat === '12'
                        ? format(setHours(new Date(), checkHours(hourIndex)), 'K a')
                        : format(setHours(new Date(), checkHours(hourIndex)), 'HH:00')}
                    </span>
                  </td>
                  {weekDates.map((day, dayIndex) => {
                    const event = data.filter((event) => {
                      const eventStartTime = parseInt(event[startTime].split(':')[0]);
                      const eventEndTime = parseInt(event[endTime].split(':')[0]);
                      return (
                        event[startDate] === format(day, 'yyyy-MM-dd') &&
                        checkHours(hourIndex) >= eventStartTime &&
                        checkHours(hourIndex) < eventEndTime
                      );
                    });
                    return (
                      <td
                        key={format(day, 'yyyy-MM-dd') + '-' + dayIndex}
                        className="time-content border border-gray-20"
                        style={{
                          backgroundColor:
                            isToday(day) && isCurrentHour(checkHours(hourIndex))
                              ? colorToHex(color) + '30'
                              : '',
                        }}
                      >
                        <div className="flex flex-col flex-wrap justify-start items-start w-full h-full gap-1 overflow-x-auto">
                          {event.map((event, index) => (
                            <div
                              title={event[property]}
                              key={index}
                              className="event p-1 w-1/2 border-t-4 overflow-y-auto h-full flex flex-col gap-1"
                              style={{
                                backgroundColor: event.color + '40',
                                borderTopColor: event.color,
                                fontSize: fontSize,
                              }}
                            >
                              {event[property]}
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
  );
};

export default Scheduler;
