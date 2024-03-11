import {
  useEnhancedNode,
  useEnhancedEditor,
  selectResolver,
  IteratorProvider,
} from '@ws-ui/webform-editor';
import { Element } from '@ws-ui/craftjs-core';
import cn from 'classnames';
import { FC } from 'react';

import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';

import { BsFillInfoCircleFill } from 'react-icons/bs';

import {
  startOfWeek,
  endOfWeek,
  endOfMonth,
  isToday,
  startOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
} from 'date-fns';

import { ICalendarProps } from './Calendar.config';

const Calendar: FC<ICalendarProps> = ({
  datasource,
  rowHeight,
  color,
  yearNav,
  style,
  className,
  classNames = [],
}) => {
  const { resolver } = useEnhancedEditor(selectResolver);

  const {
    connectors: { connect },
  } = useEnhancedNode();

  const date = new Date();

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  });

  // const prevMonth = () => setDate(subMonths(date, 1));
  // const nextMonth = () => setDate(addMonths(date, 1));
  // const nextYear = () => setDate(addMonths(date, 12));
  // const prevYear = () => setDate(subMonths(date, 12));

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="calendar-container">
        {datasource ? (
          <div className="flex flex-col justify-center items-center gap-4 w-full h-full">
            <div className="calendar-header w-full flex justify-center gap-4 items-center">
              <button className="text-2xl" style={{ display: yearNav ? 'block' : 'none' }}>
                <MdKeyboardDoubleArrowLeft />
              </button>
              <button className="text-2xl">
                <MdKeyboardArrowLeft />
              </button>
              <h2 className="w-44 text-center font-medium text-xl">{format(date, 'MMMM yyyy')}</h2>
              <button className="text-2xl">
                <MdKeyboardArrowRight />
              </button>
              <button className="text-2xl" style={{ display: yearNav ? 'block' : 'none' }}>
                <MdKeyboardDoubleArrowRight />
              </button>
            </div>
            <div className="calendar-grid w-full grid grid-cols-7 justify-center">
              {weekdays.map((day) => (
                <div key={day} className="font-medium text-lg text-center">
                  {day}
                </div>
              ))}

              {daysInMonth.map((day, index) => (
                <div
                  key={index}
                  className="day-container flex flex-col justify-start items-start gap-1 p-1 w-full border border-gray-200"
                  style={{
                    color: isSameMonth(day, date) ? 'black' : '#C0C0C0',
                    backgroundColor: isSameMonth(day, date) ? '' : '#F3F4F6',
                    height: rowHeight,
                  }}
                >
                  <div
                    className="day-number px-2 py-1 font-medium rounded-full"
                    style={{
                      backgroundColor: isToday(day) ? color : '',
                      color: isToday(day) ? 'white' : '',
                    }}
                  >
                    {format(day, 'd')}
                  </div>
                  {/* {isToday(day) ? (
                    <IteratorProvider>
                      <Element
                        id="calendar-content"
                        className="h-full w-full"
                        is={resolver.StyleBox}
                        deletable={false}
                        canvas
                      />
                    </IteratorProvider>
                  ) : null} */}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-ds flex h-full flex-col items-center justify-center rounded-lg border bg-purple-400 py-4 text-white">
            <BsFillInfoCircleFill className="mb-1 h-8 w-8" />
            <p>Please attach a datasource</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
