import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC } from 'react';
import { useState } from 'react';

import { ISchedulerProps } from './Scheduler.config';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';

import {
  isBefore,
  format,
  startOfWeek,
  addDays,
  getWeekOfMonth,
  subWeeks,
  addWeeks,
  isToday,
  setHours,
} from 'date-fns';

const Scheduler: FC<ISchedulerProps> = ({
  timeFormat,
  color,
  style,
  className,
  classNames = [],
}) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

  const [date, setDate] = useState<Date>(new Date());

  const getWeekDates = (startDate: Date) => {
    const dates = [];
    const startOfCurrentWeek = startOfWeek(startDate); // Get the start of the current week
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startOfCurrentWeek, i)); // Add days to get the dates of the week
    }
    return dates;
  };

  const weekDates = getWeekDates(date);

  const goToPreviousWeek = () => {
    setDate(subWeeks(date, 1));
  };

  const goToNextWeek = () => {
    setDate(addWeeks(date, 1));
  };

  console.log('Current time:', format(new Date(), 'HH:mm:ss'));

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="scheduler-container flex flex-col gap-4">
        <h2 className="title flex items-center justify-center gap-2">
          <span className="text-xl font-medium">{format(date, 'MMMM yyyy')}</span>
          <span className="">({getWeekOfMonth(date)}th week)</span>
        </h2>
        <div className="scheduler-grid flex justify-center">
          <table className="table-auto w-full border-collapse ">
            <thead className="scheduler-header">
              <tr>
                <th className="w-32">
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
                  <th key={index} className="w-40">
                    <div
                      key={index}
                      className="weekday-title flex flex-col items-center font-medium text-center"
                    >
                      <span className="text-sm" style={{ color: isToday(day) ? color : '' }}>
                        {format(day, 'EEE')}
                      </span>
                      <span
                        className="rounded-full text-xl mb-1 h-10 w-10 flex items-center justify-center font-medium"
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
              {Array.from({ length: 24 }).map((_, index) => (
                <tr key={index} className="h-14 w-32">
                  <td className="timeline flex items-center justify-center">
                    {timeFormat === '12'
                      ? format(setHours(new Date(), index), 'h aaa')
                      : format(setHours(new Date(), index), 'HH:00')}
                  </td>
                  {weekDates.map((day, index) => (
                    <td
                      key={format(day, 'yyyy-MM-dd') + '-' + index}
                      className="border border-gray-200"
                    >
                      <div></div>
                    </td>
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
