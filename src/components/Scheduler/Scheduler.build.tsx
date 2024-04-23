import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC } from 'react';

import { ISchedulerProps } from './Scheduler.config';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';

import { format, startOfWeek, addDays, isToday, setHours } from 'date-fns';
import { colorToHex } from '../shared/colorUtils';

const Scheduler: FC<ISchedulerProps> = ({
  hours,
  height,
  timeFormat,
  headerPosition,
  color,
  style,
  className,
  classNames = [],
}) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

  const date = new Date();

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
          <table className="table-fixed w-full h-full border-collapse">
            <thead>
              <tr>
                <th
                  className={`scheduler-header w-16 ${headerPosition === 'sticky' ? 'sticky' : ''} top-0 z-[1] bg-white`}
                >
                  <button className="nav-button p-1 text-2xl rounded-full hover:bg-gray-300 duration-300">
                    <MdKeyboardArrowLeft />
                  </button>
                  <button className="nav-button p-1 text-2xl rounded-full hover:bg-gray-300 duration-300">
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
                  <td className="flex items-center justify-center">
                    <span className="timeline text-gray-400 text-[12px] font-semibold">
                      {timeFormat === '12'
                        ? format(setHours(new Date(), checkHours(hourIndex)), 'K a')
                        : format(setHours(new Date(), checkHours(hourIndex)), 'HH:00')}
                    </span>
                  </td>
                  {weekDates.map((day, dayIndex) => (
                    <td
                      key={format(day, 'yyyy-MM-dd') + '-' + dayIndex}
                      className="time-content border border-gray-200"
                      style={{
                        backgroundColor:
                          isToday(day) && isCurrentHour(checkHours(hourIndex))
                            ? colorToHex(color) + '30'
                            : '',
                      }}
                    ></td>
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
