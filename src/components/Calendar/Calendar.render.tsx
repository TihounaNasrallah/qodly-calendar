import { useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState, useMemo } from 'react';

import { BsFillInfoCircleFill } from 'react-icons/bs';

import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';

import { colorToHex, generateColorPalette, randomColor } from '../shared/colorUtils';

import {
  differenceInDays,
  isEqual,
  parseISO,
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

import { fr, es, de } from 'date-fns/locale';

const Calendar: FC<ICalendarProps> = ({
  type,
  language,
  attributes,
  property,
  startDate,
  endDate,
  rowHeight,
  color,
  selectedColor,
  colors = [],
  colorProp,
  yearNav,
  borderRadius,
  style,
  className,
  classNames = [],
}) => {
  const { connect, emit } = useRenderer();

  const {
    sources: { datasource: ds, currentElement: currentDate },
  } = useSources();

  useEffect(() => {
    if (!ds) return;

    const listener = async (/* event */) => {
      const v = await ds.getValue<any>();
      setData(v);
    };

    listener();

    ds.addListener('changed', listener);

    return () => {
      ds.removeListener('changed', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds, currentDate]);

  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const checkParams = useMemo(() => {
    if (!ds) {
      return 'Please set the datasource attribute';
    } else if (!data[0] || !data.length) {
      return '';
    }

    if (!property) {
      return 'Please set the property attribute';
    } else if (!(property in data[0])) {
      return `${property} does not exist as a property`;
    }
    if (!startDate) {
      return 'Please set the Start Date attribute';
    } else if (!(startDate in data[0])) {
      return `${startDate} does not exist as a property`;
    }
    if (!endDate) {
      return 'Please set the End Date attribute';
    } else if (!(endDate in data[0])) {
      return `${endDate} does not exist as a property`;
    }
    return '';
  }, [ds, data, property, startDate, endDate]);

  const handleDateClick = async (value: Date) => {
    currentDate.setValue(null, value);
    const ce = await currentDate.getValue<any>();
    setSelectedDate(ce);
    emit('onDateClick', { day: value });
  };

  const colorgenerated = useMemo(
    () => generateColorPalette(data.length, ...colors.map((e) => e.color || randomColor())),
    [data.length, colors],
  );

  let attributeList: any[] = [];
  attributes?.forEach((e) => {
    attributeList.push(e.Attribute);
  });

  let newData = useMemo(
    () =>
      data.map((obj, index) => ({
        ...obj,
        color: obj[colorProp] || colorgenerated[index],
      })),
    [data, colorgenerated, colorProp],
  );

  const list = useMemo(() => {
    const result: any[] = [];
    newData.forEach((conge) => {
      const num = differenceInDays(parseISO(conge[endDate]), parseISO(conge[startDate]));
      for (let i = 0; i <= num; i++) {
        result.push({
          title: conge[property],
          startDate: addDays(parseISO(conge[startDate]), i),
          endDate: addDays(parseISO(conge[startDate]), i),
          color: conge.color,
          attributes: attributeList.reduce((acc, e) => {
            acc[e] = conge[e];
            return acc;
          }, {}),
        });
      }
    });
    return result;
  }, [newData, attributeList, endDate, startDate, property]);

  const congesByDate = useMemo(() => {
    return list.reduce((acc: { [key: string]: any[] }, conge) => {
      const dateKey = format(conge?.startDate, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(conge);
      return acc;
    }, {});
  }, [data]);

  const [showScrollbar, setShowScrollbar] = useState(false);

  const daysInMonth = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
      }),
    [date],
  );

  const prevMonth = () => setDate(subMonths(date, 1));
  const nextMonth = () => setDate(addMonths(date, 1));
  const nextYear = () => setDate(addMonths(date, 12));
  const prevYear = () => setDate(subMonths(date, 12));

  const isSelected = (date: Date) => {
    return isEqual(date, selectedDate);
  };

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

  return !checkParams ? (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div className="calendar-container flex flex-col gap-4 w-full h-full">
        <div className="calendar-header w-full flex justify-center gap-2 items-center">
          <button
            className="nav-button text-2xl cursor-pointer rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={prevYear}
            style={{ display: yearNav ? 'block' : 'none' }}
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button
            className="nav-button text-2xl cursor-pointer rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={prevMonth}
          >
            <MdKeyboardArrowLeft />
          </button>
          <h2 className="month-title w-44 text-center font-medium text-xl">
            {format(date, 'MMMM yyyy', locale).charAt(0).toUpperCase() +
              format(date, 'MMMM yyyy', locale).slice(1)}
          </h2>
          <button
            className="nav-button text-2xl cursor-pointer rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={nextMonth}
          >
            <MdKeyboardArrowRight />
          </button>
          <button
            className="nav-button text-2xl cursor-pointer rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={nextYear}
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
            <span
              key={day.title}
              title={day.day}
              className="weekday-title font-medium text-lg text-center"
            >
              {day.title}
            </span>
          ))}
          {filteredDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const todaysConges = congesByDate[dateKey] || [];
            return (
              <div
                key={day.toString()}
                className="day-container flex flex-col justify-start items-start gap-1 py-1 px-1 w-full border border-gray-200"
                style={{
                  color: isSameMonth(day, date) ? 'black' : '#C0C0C0',
                  backgroundColor: isSameMonth(day, date) ? 'white' : '#F3F4F6',
                  height: rowHeight,
                }}
              >
                <div className="h-fit w-full cursor-pointer">
                  <span
                    className="day-number h-7 w-7 flex items-center justify-center font-medium rounded-full cursor-pointer hover:bg-gray-300 duration-300"
                    style={{
                      border: isSelected(day) ? `2px solid ${colorToHex(selectedColor)}` : '',
                      backgroundColor: isToday(day) ? color : '',
                      color: isToday(day) ? 'white' : '',
                    }}
                    onClick={() => handleDateClick(day)}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                <div
                  onMouseEnter={() => setShowScrollbar(true)}
                  onMouseLeave={() => setShowScrollbar(false)}
                  className={`date-content w-full grid grid-cols-1 gap-1 overflow-hidden ${showScrollbar ? 'overflow-y-auto' : ''}`}
                >
                  {todaysConges.map((conge, index) => {
                    return (
                      <div
                        key={`${conge.title}-${conge.startDate}`}
                        className={`element-container px-2 py-1 flex flex-col w-full border-l-4 text-black`}
                        style={{
                          color: isSameMonth(day, date) ? 'black' : '#969696',
                          backgroundColor: isSameMonth(day, date) ? conge?.color + '50' : '#E3E3E3',
                          borderRadius: borderRadius,
                          borderLeftColor: isSameMonth(day, date) ? conge?.color : '#C0C0C0',
                        }}
                      >
                        <span
                          title={conge.title}
                          key={index}
                          className="element-title font-medium line-clamp-2"
                        >
                          {conge.title}
                        </span>

                        <div className="element-detail flex flex-wrap">
                          {attributeList?.map((e) => {
                            return (
                              <span
                                className="attribute text-sm basis-1/2 text-start"
                                title={conge.attributes[e].toString()}
                              >
                                {conge.attributes[e]}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-red-600 py-4 text-red-700">
      <BsFillInfoCircleFill className=" h-6 w-6" />
      <p className=" font-medium">{checkParams}</p>
    </div>
  );
};

export default Calendar;
