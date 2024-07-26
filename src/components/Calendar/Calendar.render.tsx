import { splitDatasourceID, useRenderer, useSources, useWebformPath } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState, useMemo, useRef } from 'react';

import { BsFillInfoCircleFill } from 'react-icons/bs';

import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';

import { colorToHex, generateColorPalette, randomColor } from '../shared/colorUtils';

import {
  isEqual,
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

import { fr, es, de } from 'date-fns/locale';

const Calendar: FC<ICalendarProps> = ({
  type,
  language,
  selectedDate,
  property,
  startDate,
  endDate,
  rowHeight,
  color,
  selectedColor,
  colors = [],
  attributes = [],
  colorProp,
  yearNav,
  borderRadius,
  style,
  className,
  classNames = [],
}) => {
  const { connect, emit } = useRenderer();
  const {
    sources: { datasource: ds, currentElement: selectedElement },
  } = useSources();

  const [value, setValue] = useState<any[]>([]);
  const [date, setDate] = useState(new Date());
  const [, setSelectedData] = useState<Object>();
  const [selDate, setSelDate] = useState(new Date());
  const hasMounted = useRef(false);
  const path = useWebformPath();

  useEffect(() => {
    if (!ds) return;

    const listener = async (/* event */) => {
      const v = await ds.getValue<any>();
      setValue(v);
    };

    listener();

    ds.addListener('changed', listener);

    return () => {
      ds.removeListener('changed', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds]);

  useEffect(() => {
    if (hasMounted.current) {
      emit('onMonthChange', { currentDate: date });
    } else {
      hasMounted.current = true;
    }
  }, [date]);

  const checkParams = useMemo(() => {
    if (!ds) {
      return 'Please set "Datasource"';
    } else if (!value[0] || !value.length) {
      return '';
    }

    if (!property) {
      return 'Please set "Property"';
    } else if (!(property in value[0])) {
      return `"${property}" does not exist as an attribute`;
    }
    if (!startDate) {
      return 'Please set the "Start Date"';
    } else if (!(startDate in value[0])) {
      return `"${startDate}" does not exist as an attribute`;
    }
    if (!endDate) {
      return 'Please set the "End Date"';
    } else if (!(endDate in value[0])) {
      return `"${endDate}" does not exist as an attribute`;
    }
    return '';
  }, [ds, value, property, startDate, endDate]);

  const prevMonth = () => setDate(subMonths(date, 1));
  const nextMonth = () => setDate(addMonths(date, 1));
  const nextYear = () => setDate(addMonths(date, 12));
  const prevYear = () => setDate(subMonths(date, 12));

  const handleDateClick = async (value: Date) => {
    if (!selectedDate) return;
    const { id, namespace } = splitDatasourceID(selectedDate);
    const ds =
      window.DataSource.getSource(id, namespace) || window.DataSource.getSource(selectedDate, path);
    ds?.setValue(null, value);
    const ce = await ds?.getValue();
    setSelDate(ce);
    emit('onDateClick', { selectedDate: ce });
  };

  const handleItemClick = async (value: Object) => {
    if (!selectedElement) return;
    selectedElement.setValue(null, value);
    const ce = await selectedElement.getValue<any>();
    setSelectedData(ce);
    emit('onItemClick', { selectedData: ce });
  };

  const colorgenerated = useMemo(
    () => generateColorPalette(value.length, ...colors.map((e) => e.color || randomColor())),
    [value.length],
  );

  let attributeList = attributes?.map((e) => e.Attribute);

  let coloredData = useMemo(
    () =>
      value.map((obj, index) => ({
        ...obj,
        color: obj[colorProp] || colorgenerated[index],
        attributes: attributeList?.reduce((acc: { [key: string]: any }, e) => {
          acc[e] = obj[e];
          return acc;
        }, {}),
      })),
    [value, colorgenerated, colorProp, attributeList],
  );

  const daysInMonth = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
      }),
    [date],
  );

  const isSelected = (date: Date) => {
    return isEqual(date, selDate);
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
        <div
          className={`calendar-header w-full flex justify-center gap-2 items-center ${style?.fontSize ? style?.fontSize : 'text-xl'}`}
        >
          <button
            title="Previous year"
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={prevYear}
            style={{ display: yearNav ? 'block' : 'none' }}
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button
            title="Previous month"
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={prevMonth}
          >
            <MdKeyboardArrowLeft />
          </button>
          <h2
            className={`month-title w-44 text-center ${style?.fontWeight ? style?.fontWeight : 'font-semibold'}`}
          >
            {format(date, 'MMMM yyyy', locale).charAt(0).toUpperCase() +
              format(date, 'MMMM yyyy', locale).slice(1)}
          </h2>
          <button
            title="Next month"
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={nextMonth}
          >
            <MdKeyboardArrowRight />
          </button>
          <button
            title="Next year"
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
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
              className={`weekday-title ${style?.fontWeight ? style?.fontWeight : 'font-medium'} ${style?.fontSize ? style?.fontSize : 'text-lg'} text-center`}
            >
              {day.title}
            </span>
          ))}
          {filteredDays.map((day) => {
            const data = coloredData.filter((item) => {
              const itemStartDate = new Date(item.startDate);
              const itemEndDate = new Date(item.endDate);
              return day >= itemStartDate && day <= itemEndDate;
            });
            return (
              <div
                key={day.toString()}
                className={`day-container flex flex-col justify-start items-start gap-1 p-1 w-full`}
                style={{
                  color: isSameMonth(day, date)
                    ? style?.color
                      ? style?.color
                      : 'black'
                    : '#C0C0C0',
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
                  className={`date-content w-full grid grid-cols-1 gap-1 overflow-hidden overflow-y-auto`}
                >
                  {data.map((conge, index) => {
                    return (
                      <div
                        key={`${conge[property]}-${conge[startDate]}`}
                        className={`element-container cursor-pointer px-2 py-1 flex flex-col w-full border-l-4 text-black`}
                        style={{
                          color: isSameMonth(day, date) ? 'black' : '#969696',
                          backgroundColor: isSameMonth(day, date)
                            ? colorToHex(conge?.color) + '50'
                            : '#E3E3E3',
                          borderRadius: borderRadius,
                          borderLeftColor: isSameMonth(day, date) ? conge?.color : '#C0C0C0',
                        }}
                        onClick={() => handleItemClick(conge)}
                      >
                        <span
                          title={conge[property]}
                          key={index}
                          className={`element-title ${style?.fontWeight ? style?.fontWeight : 'font-medium'} line-clamp-2`}
                        >
                          {conge[property]}
                        </span>

                        <div key={`attributes-${index}`} className="element-detail flex flex-wrap">
                          {attributeList?.map((e) => {
                            return (
                              <span
                                key={`attribute-${index}-${e}`}
                                className={`attribute ${style?.fontSize ? style?.fontSize : 'text-sm'} basis-1/2 text-start`}
                                title={conge?.attributes[e]?.toString()}
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
