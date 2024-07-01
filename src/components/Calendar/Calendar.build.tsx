import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useMemo } from 'react';

import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';

import { TinyColor } from '@ctrl/tinycolor';

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

import { fr, es, de } from 'date-fns/locale';

import { ICalendarProps } from './Calendar.config';

const Calendar: FC<ICalendarProps> = ({
  type,
  language,
  attributes,
  property,
  rowHeight,
  color,
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
  const firstDayOfMonth = startOfMonth(date);

  const daysInMonth = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
      }),
    [date],
  );

  const languageList = {
    en: [
      { title: 'Mon', day: 'Monday' },
      { title: 'Tue', day: 'Tuesday' },
      { title: 'Wed', day: 'Wednesday' },
      { title: 'Thu', day: 'Thursday' },
      { title: 'Fri', day: 'Friday' },
      { title: 'Sat', day: 'Saturday' },
      { title: 'Sun', day: 'Sunday' },
    ],
    fr: [
      { title: 'Lun', day: 'Lundi' },
      { title: 'Mar', day: 'Mardi' },
      { title: 'Mer', day: 'Mercredi' },
      { title: 'Jeu', day: 'Jeudi' },
      { title: 'Ven', day: 'Vendredi' },
      { title: 'Sam', day: 'Samedi' },
      { title: 'Dim', day: 'Dimanche' },
    ],
    es: [
      { title: 'Lun', day: 'Lunes' },
      { title: 'Mar', day: 'Martes' },
      { title: 'Mie', day: 'Miercoles' },
      { title: 'Jue', day: 'Jueves' },
      { title: 'Vie', day: 'Viernes' },
      { title: 'Sab', day: 'Sabado' },
      { title: 'Dom', day: 'Domingo' },
    ],
    de: [
      { title: 'Mo', day: 'Montag' },
      { title: 'Di', day: 'Dienstag' },
      { title: 'Mi', day: 'Mittwoch' },
      { title: 'Do', day: 'Donnerstag' },
      { title: 'Fr', day: 'Freitag' },
      { title: 'Sa', day: 'Samstag' },
      { title: 'So', day: 'Sonntag' },
    ],
  };

  const [weekdays, locale] = useMemo(() => {
    let weekdays = languageList.en;
    let locale = {};

    if (language === 'fr') {
      weekdays = languageList.fr;
      locale = { locale: fr };
    } else if (language === 'es') {
      weekdays = languageList.es;
      locale = { locale: es };
    } else if (language === 'de') {
      weekdays = languageList.de;
      locale = { locale: de };
    }

    if (type === 'work') {
      weekdays = weekdays.slice(0, 5);
    }

    return [weekdays, locale];
  }, [language, type]);

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
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
            style={{ display: yearNav ? 'block' : 'none' }}
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300">
            <MdKeyboardArrowLeft />
          </button>
          <h2
            className={`month-title w-44 text-center ${style?.fontWeight ? style?.fontWeight : 'font-semibold'}`}
          >
            {format(date, 'MMMM yyyy', locale).charAt(0).toUpperCase() +
              format(date, 'MMMM yyyy', locale).slice(1)}
          </h2>
          <button className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300">
            <MdKeyboardArrowRight />
          </button>
          <button
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
            style={{ display: yearNav ? 'block' : 'none' }}
          >
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>
        <div
          className="calendar-grid w-full grid justify-center"
          style={{
            gridTemplateColumns: `repeat(${weekdays.length}, minmax(0, 1fr))`,
          }}
        >
          {weekdays.map((day) => (
            <div
              key={day.title}
              title={day.day}
              className={`weekday-title ${style?.fontWeight ? style?.fontWeight : 'font-medium'} ${style?.fontSize ? style?.fontSize : 'text-lg'} text-center`}
            >
              {day.title}
            </div>
          ))}

          {filteredDays.map((day, index) => (
            <div
              key={index}
              className={`day-container flex flex-col justify-start items-start gap-1 p-1 w-full border ${style?.borderColor ? style?.borderColor : 'border-gray-200'}`}
              style={{
                color: isSameMonth(day, date) ? (style?.color ? style?.color : 'black') : '#C0C0C0',
                backgroundColor: isSameMonth(day, date) ? 'white' : '#F3F4F6',
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
                  className="element-container px-2 py-1 flex flex-col w-full border-l-4"
                  style={{
                    borderRadius: borderRadius,
                    backgroundColor: new TinyColor('#C084FC').toHexString() + '50',
                    borderLeftColor: new TinyColor('#C084FC').toHexString(),
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
