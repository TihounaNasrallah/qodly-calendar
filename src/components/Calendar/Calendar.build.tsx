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

import { randomColor } from '../shared/colorUtils';
import { TinyColor } from '@ctrl/tinycolor';

import { BsFillInfoCircleFill } from 'react-icons/bs';

import {
  isEqual,
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
  attributes,
  property,
  rowHeight,
  color,
  colors = [],
  yearNav,
  borderRadius,
  style,
  className,
  classNames = [],
}) => {
  const { resolver } = useEnhancedEditor(selectResolver);

  const {
    connectors: { connect },
  } = useEnhancedNode();

  const date = new Date();
  const firstDayOfMonth = startOfMonth(date);

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  });

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="calendar-container">
        {datasource ? (
          <div className="flex flex-col gap-4 w-full h-full">
            <div className="calendar-header w-full flex justify-center gap-4 items-center">
              <button
                className="nav-button text-2xl"
                style={{ display: yearNav ? 'block' : 'none' }}
              >
                <MdKeyboardDoubleArrowLeft />
              </button>
              <button className="nav-button text-2xl">
                <MdKeyboardArrowLeft />
              </button>
              <h2 className="month-title w-44 text-center font-medium text-xl">
                {format(date, 'MMMM yyyy')}
              </h2>
              <button className="nav-button text-2xl">
                <MdKeyboardArrowRight />
              </button>
              <button
                className="nav-button text-2xl"
                style={{ display: yearNav ? 'block' : 'none' }}
              >
                <MdKeyboardDoubleArrowRight />
              </button>
            </div>
            <div className="calendar-grid w-full grid grid-cols-7 justify-center">
              {weekdays.map((day) => (
                <div key={day} className="weekday-title font-medium text-lg text-center">
                  {day}
                </div>
              ))}

              {daysInMonth.map((day, index) => (
                <div
                  key={index}
                  className="day-container flex flex-col justify-start items-start gap-1 p-1 w-full border border-gray-200"
                  style={{
                    color: isSameMonth(day, date) ? 'black' : '#C0C0C0',
                    backgroundColor: isSameMonth(day, date) ? 'white' : '#F3F4F6',
                    height: rowHeight,
                  }}
                >
                  <div className="h-fit w-full">
                    <span
                      className="day-number h-7 w-7 flex items-center justify-center font-medium rounded-full"
                      style={{
                        backgroundColor: isToday(day) ? color : '',
                        color: isToday(day) ? 'white' : '',
                      }}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                  {isEqual(day, firstDayOfMonth) ? (
                    <div
                      className="element-container px-2 py-1 flex flex-col w-full border-l-4"
                      style={{
                        borderRadius: borderRadius,
                        backgroundColor: new TinyColor(colors[0]?.color).toHexString() + '50',
                        borderLeftColor: new TinyColor(colors[0]?.color).toHexString(),
                      }}
                    >
                      <span className="element-title font-medium line-clamp-2">
                        {'{'}
                        {property}
                        {'}'}
                      </span>

                      <div className="element-detail flex flex-wrap">
                        {attributes?.map((attribute, index) => (
                          <span key={index} className="attribute text-sm basis-1/2 text-start">
                            {'{'}
                            {attribute.Attribute}
                            {'}'}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : // <IteratorProvider>
                  //   <Element
                  //     id="calendar-content"
                  //     className="h-full w-full"
                  //     is={resolver.StyleBox}
                  //     deletable={false}
                  //     canvas
                  //   />
                  // </IteratorProvider>
                  null}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-ds flex h-full flex-col items-center justify-center rounded-lg border bg-purple-500 py-4 text-white">
            <BsFillInfoCircleFill className="mb-1 h-9 w-9" />
            <p className=" text-lg">Please attach a datasource</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
