import {
  useRenderer,
  useSources,
  useEnhancedEditor,
  selectResolver,
  EntityProvider,
  useDataLoader,
  unsubscribeFromDatasource,
} from '@ws-ui/webform-editor';

import { Element } from '@ws-ui/craftjs-core';
import cn from 'classnames';
import { FC, useEffect, useState, useMemo } from 'react';

import React from 'react';

import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';
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
  addDays,
} from 'date-fns';

import { ICalendarProps } from './Calendar.config';

const Calendar: FC<ICalendarProps> = ({
  iterator,
  name,
  rowHeight,
  color,
  yearNav,
  style,
  className,
  classNames = [],
}) => {
  const { connect } = useRenderer();

  const { resolver } = useEnhancedEditor(selectResolver);

  const [value, setValue] = useState<Date>(new Date());

  const {
    sources: { datasource: ds, currentElement: currentDs },
  } = useSources();

  // const { entities } = useDataLoader({
  //   source: ds,
  // });

  useEffect(() => {
    if (!ds) return;

    const listener = async (/* event */) => {
      const v = await ds.getValue();
      setValue(v);
    };

    listener();

    ds.addListener('changed', listener);

    return () => {
      ds.removeListener('changed', listener);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds]);

  const [date, setDate] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  });

  const prevMonth = () => setDate(subMonths(date, 1));
  const nextMonth = () => setDate(addMonths(date, 1));
  const nextYear = () => setDate(addMonths(date, 12));
  const prevYear = () => setDate(subMonths(date, 12));

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="calendar-container flex flex-col justify-center items-center gap-4 w-full h-full">
        <div className="calendar-header w-full flex justify-center gap-4 items-center">
          <button
            className="text-2xl cursor-pointer"
            onClick={prevYear}
            style={{ display: yearNav ? 'block' : 'none' }}
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button className="text-2xl cursor-pointer" onClick={prevMonth}>
            <MdKeyboardArrowLeft />
          </button>
          <h2 className="w-44 text-center font-medium text-xl">{format(date, 'MMMM yyyy')}</h2>
          <button className="text-2xl cursor-pointer" onClick={nextMonth}>
            <MdKeyboardArrowRight />
          </button>
          <button
            className="text-2xl cursor-pointer"
            onClick={nextYear}
            style={{ display: yearNav ? 'block' : 'none' }}
          >
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>

        <div className="calendar-grid w-full grid justify-center grid-cols-7">
          {weekdays.map((day) => (
            <div key={day} className="font-medium text-lg text-center">
              {day}
            </div>
          ))}
          {daysInMonth.map((day, index) => (
            <div
              key={day.toString()}
              className="day-container flex flex-col justify-start items-start gap-1 p-1 w-full border border-gray-200"
              style={{
                color: isSameMonth(day, date) ? 'black' : '#C0C0C0',
                backgroundColor: isSameMonth(day, date) ? '' : '#F3F4F6',
                height: rowHeight,
              }}
            >
              <div
                className="px-2 py-1 font-medium rounded-full"
                style={{
                  backgroundColor: isToday(day) ? color : '',
                  color: isToday(day) ? 'white' : '',
                }}
              >
                {format(day, 'd')}
              </div>
              <div className="date-content h-full w-full">
                <EntityProvider
                  index={index}
                  selection={ds}
                  current={currentDs?.id}
                  iterator={iterator}
                >
                  <Element
                    id="calendar-content"
                    className="h-full w-full"
                    is={resolver.StyleBox}
                    canvas
                  />
                </EntityProvider>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
