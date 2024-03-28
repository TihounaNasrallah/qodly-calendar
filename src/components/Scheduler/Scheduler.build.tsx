import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC } from 'react';
import { useState } from 'react';

import { ISchedulerProps } from './Scheduler.config';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';

import { format, startOfWeek, addDays, getWeekOfMonth, isToday, setHours } from 'date-fns';
import { colorToHex } from '../shared/colorUtils';

const Scheduler: FC<ISchedulerProps> = ({
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

  const [date, setDate] = useState<Date>(new Date());

  const getWeekDates = (startDate: Date) => {
    const dates = [];
    const startOfCurrentWeek = startOfWeek(startDate); // Get the start of the current week
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

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="scheduler-container flex flex-col gap-4 h-full">
        <h2 className="title flex items-center justify-center gap-2">
          <span className="text-xl font-medium">{format(date, 'MMMM yyyy')}</span>
        </h2>
        <div className="scheduler-grid flex justify-center">
          <table className="table-fixed w-full border-collapse ">
            <thead className="scheduler-header">
              <tr>
                <th
                  className={`w-20 ${headerPosition === 'sticky' ? 'sticky' : ''} top-0 z-[1] bg-white `}
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
                    className={`w-36 ${headerPosition === 'sticky' ? 'sticky' : ''} top-0 z-[1] bg-white `}
                  >
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
              {Array.from({ length: 24 }).map((_, hourIndex) => (
                <tr key={hourIndex} className="h-16 w-36">
                  <td className="timeline flex items-center justify-center">
                    <span className=" text-gray-400 text-[12px] font-semibold">
                      {timeFormat === '12'
                        ? format(setHours(new Date(), hourIndex), 'K a')
                        : format(setHours(new Date(), hourIndex), 'HH:00')}
                    </span>
                  </td>
                  {weekDates.map((day, dayIndex) => (
                    <td
                      key={dayIndex + '-' + hourIndex}
                      className="border border-gray-200"
                      style={{
                        backgroundColor:
                          isToday(day) && isCurrentHour(hourIndex) ? colorToHex(color) + '30' : '',
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
