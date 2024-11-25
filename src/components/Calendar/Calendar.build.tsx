import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useMemo } from 'react';

import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';

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
  addDays,
} from 'date-fns';

import { fr, es, de, enUS } from 'date-fns/locale';

import { ICalendarProps } from './Calendar.config';
import { colorToHex } from '../shared/colorUtils';

const Calendar: FC<ICalendarProps> = ({
  type,
  weekStart,
  language,
  attributes,
  property,
  rowHeight,
  color,
  selectedColor,
  yearNav,
  borderRadius,
  style,
  className,
  classNames = [],
}) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

  const date = new Date();
  const startOfWeekInt = parseInt(weekStart, 10) as 0 | 1;
  const firstDayOfMonth = startOfWeek(startOfMonth(date), { weekStartsOn: startOfWeekInt });

  const daysInMonth = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(date), { weekStartsOn: startOfWeekInt }),
        end: endOfWeek(endOfMonth(date), { weekStartsOn: startOfWeekInt }),
      }),
    [date],
  );

  let localeVar = language === 'fr' ? fr : language === 'es' ? es : language === 'de' ? de : enUS;

  let weekDays = Array.from({ length: type === 'work' ? 5 : 7 }, (_, i) => {
    return {
      index: addDays(startOfWeek(date, { weekStartsOn: startOfWeekInt }), i),
      title: format(addDays(startOfWeek(date, { weekStartsOn: startOfWeekInt }), i), 'EE', {
        locale: localeVar,
      }),
      day: format(addDays(startOfWeek(date, { weekStartsOn: startOfWeekInt }), i), 'EEEE', {
        locale: localeVar,
      }),
    };
  });

  const filteredDays = useMemo(
    () =>
      daysInMonth.filter((day) => {
        if (type === 'work') {
          const dayOfWeek = day.getDay();
          return dayOfWeek >= 1 && dayOfWeek <= 5;
        }
        return true;
      }),
    [daysInMonth, type],
  );

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="calendar-container flex flex-col gap-4 w-full h-full">
        <div
          className={`calendar-header w-full flex justify-center gap-2 items-center ${style?.fontSize ? style?.fontSize : 'text-xl'}`}
        >
          <button
            title="Previous year"
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
            style={{ display: yearNav ? '' : 'none' }}
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button
            title="Previous month"
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
          >
            <MdKeyboardArrowLeft />
          </button>
          <h2
            className={`month-title w-44 text-center ${style?.fontWeight ? style?.fontWeight : 'font-semibold'}`}
          >
            {format(date, 'MMMM yyyy', { locale: localeVar }).charAt(0).toUpperCase() +
              format(date, 'MMMM yyyy', { locale: localeVar }).slice(1)}
          </h2>
          <button
            title="Next month"
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
          >
            <MdKeyboardArrowRight />
          </button>
          <button
            title="Next year"
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
            style={{ display: yearNav ? '' : 'none' }}
          >
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>
        <div
          className="calendar-grid w-full grid justify-center"
          style={{
            gridTemplateColumns: `repeat(${weekDays.length}, minmax(0, 1fr))`,
          }}
        >
          {weekDays.map((day) => (
            <div
              key={day.title}
              title={day.day}
              className={`weekday-title ${style?.fontWeight ? style?.fontWeight : 'font-medium'} ${style?.fontSize ? style?.fontSize : 'text-lg'} text-center`}
            >
              {format(day.index, 'EEE', { locale: localeVar }).charAt(0).toUpperCase() +
                format(day.index, 'EEE', { locale: localeVar }).slice(1)}
            </div>
          ))}

          {filteredDays.map((day, index) => (
            <div
              key={index}
              className={`day-container flex flex-col justify-start items-start gap-1 p-1 w-full`}
              style={{
                color: isSameMonth(day, date) ? (style?.color ? style?.color : 'black') : '#C0C0C0',
                borderWidth: style?.borderWidth ? style?.borderWidth : '1px',
                borderColor: style?.borderColor ? style?.borderColor : '#E0E0E0',
                backgroundColor: isSameMonth(day, date)
                  ? style?.backgroundColor
                    ? style?.backgroundColor
                    : 'white'
                  : '#F3F4F6',
                height: rowHeight,
              }}
            >
              <div className="h-fit w-full">
                <span
                  className={`day-number h-7 w-7 flex items-center justify-center ${style?.fontWeight ? style?.fontWeight : 'font-medium'} rounded-full cursor-pointer hover:bg-gray-300 duration-300`}
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
                  className="element-container px-2 py-1 flex flex-col w-full border-l-4 text-black"
                  style={{
                    borderRadius: borderRadius,
                    backgroundColor: colorToHex(selectedColor) + '50',
                    borderLeftColor: colorToHex(selectedColor),
                  }}
                >
                  <span
                    className={`element-title ${style?.fontWeight ? style?.fontWeight : 'font-medium'} line-clamp-2`}
                  >
                    {property ? '{' + property + '}' : 'No Property Set'}
                  </span>

                  <div className="element-detail flex flex-wrap">
                    {attributes?.map((attribute, index) => (
                      <span
                        key={index}
                        className={`attribute ${style?.fontSize ? style?.fontSize : 'text-sm'} basis-1/2 text-start`}
                      >
                        {attribute.Attribute}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
