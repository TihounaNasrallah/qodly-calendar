import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC } from 'react';

import './Calendar.css';
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';
import React, { useState } from 'react';
import {
  startOfWeek,
  endOfWeek,
  endOfMonth,
  isToday,
  startOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  format,
  isSameMonth,
} from 'date-fns';

import { ICalendarProps } from './Calendar.config';

const Calendar: FC<ICalendarProps> = ({
  rowHeight,
  color,
  yearNav,
  style,
  className,
  classNames = [],
}) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

  const [date, setDate] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  });

  const prevMonth = () => setDate(subMonths(date, 1));
  const nextMonth = () => setDate(addMonths(date, 1));
  const nextYear = () => setDate(addMonths(date, 12));
  const prevYear = () => setDate(subMonths(date, 12));

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={prevYear} style={{ display: yearNav ? 'block' : 'none' }}>
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button onClick={prevMonth}>
            <MdKeyboardArrowLeft />
          </button>
          <h2 className="title">{format(date, 'MMMM yyyy')}</h2>
          <button onClick={nextMonth}>
            <MdKeyboardArrowRight />
          </button>
          <button onClick={nextYear} style={{ display: yearNav ? 'block' : 'none' }}>
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>

        <div className="calendar-grid">
          <div className="day-name ">Mon</div>
          <div className="day-name ">Tue</div>
          <div className="day-name ">Wed</div>
          <div className="day-name ">Thu</div>
          <div className="day-name ">Fri</div>
          <div className="day-name ">Sat</div>
          <div className="day-name ">Sun</div>
          {daysInMonth.map((day) => (
            <div
              key={day.toString()}
              className="calendar-day"
              style={{
                color: isSameMonth(day, date) ? 'black' : '#C0C0C0',
                height: rowHeight,
              }}
            >
              <div
                className="day-number"
                style={{
                  backgroundColor: isToday(day) ? color : '',
                  color: isToday(day) ? 'white' : '',
                }}
              >
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
