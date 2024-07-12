import { DataLoader, useRenderer, useSources, useWebformPath } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState, useMemo, useRef, useCallback } from 'react';

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
  attributes = [],
  selectedDate,
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
    sources: { datasource: ds, currentElement: selectedElement },
  } = useSources();

  const [date, setDate] = useState(new Date());
  const currentMonth = date.getMonth();
  const [data, setData] = useState<any[]>([]);
  const [selectedData, setSelectedData] = useState<Object>({});
  const [selDate, setSelDate] = useState(new Date());
  const hasMounted = useRef(false);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const path = useWebformPath();

  switch (ds.type) {
    case 'scalar':
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
      }, [ds]);
      break;

    case 'entitysel':
      const loader = useMemo<DataLoader | any>(() => {
        if (!ds) return;
        return DataLoader.create(ds, [
          property,
          startDate,
          endDate,
          colorProp,
          ...attributes.map((a) => a.Attribute as string),
        ]);
      }, [ds, property]);

      const updateFromLoader = useCallback(() => {
        if (!loader) return;
        setData(loader.page);
      }, [loader]);

      useEffect(() => {
        if (!loader || !ds) return;

        loader.sourceHasChanged().then(updateFromLoader);
      }, []);
      break;

    default:
      break;
  }

  const checkParams = useMemo(() => {
    if (!ds) {
      return 'Please set "Datasource"';
    } else if (!data[0] || !data.length) {
      return '';
    }

    if (!property) {
      return 'Please set "Property"';
    } else if (!(property in data[0])) {
      return `"${property}" does not exist as an attribute`;
    }
    if (!startDate) {
      return 'Please set the Start Date attribute';
    } else if (!(startDate in data[0])) {
      return `"${startDate}" does not exist as an attribute`;
    }
    if (!endDate) {
      return 'Please set the End Date attribute';
    } else if (!(endDate in data[0])) {
      return `"${endDate}" does not exist as an attribute`;
    }
    return '';
  }, [ds, data, property, startDate, endDate]);

  useEffect(() => {
    if (hasMounted.current) {
      emit('onMonthChange');
    } else {
      hasMounted.current = true;
    }
  }, [date, currentMonth]);

  const handleDateClick = async (value: Date) => {
    if (!selectedDate) return;
    const ds = window.DataSource.getSource(selectedDate, path);
    ds?.setValue(null, value);
    const ce = await ds?.getValue();
    setSelDate(ce);
    emit('onDateClick');
  };

  const handleItemClick = async (value: Object) => {
    if (!selectedElement) return;
    switch (selectedElement.type) {
      case 'scalar':
        selectedElement.setValue(null, value);
        let ce = await selectedElement.getValue<Object>();
        setSelectedData(ce);
        emit('onItemClick');
        break;

      case 'entity':
        // TODO : implement entity rendering

        break;
    }
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
      const num = differenceInDays(new Date(conge[endDate]), new Date(conge[startDate]));
      for (let i = 0; i <= num; i++) {
        result.push({
          name: conge[property],
          startDate: addDays(new Date(conge[startDate]), i),
          endDate: addDays(new Date(conge[startDate]), i),
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
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={prevYear}
            style={{ display: yearNav ? 'block' : 'none' }}
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button
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
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={nextMonth}
          >
            <MdKeyboardArrowRight />
          </button>
          <button
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
            const dateKey = format(day, 'yyyy-MM-dd');
            const todaysConges = congesByDate[dateKey] || [];
            return (
              <div
                key={day.toString()}
                className={`day-container flex flex-col justify-start items-start gap-1 p-1 w-full border ${style?.borderColor ? style?.borderColor : 'border-gray-200'}`}
                style={{
                  color: isSameMonth(day, date)
                    ? style?.color
                      ? style?.color
                      : 'black'
                    : '#C0C0C0',
                  backgroundColor: isSameMonth(day, date) ? 'white' : '#F3F4F6',
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
                  onMouseEnter={() => setShowScrollbar(true)}
                  onMouseLeave={() => setShowScrollbar(false)}
                  className={`date-content w-full grid grid-cols-1 gap-1 overflow-hidden ${showScrollbar ? 'overflow-y-auto' : ''}`}
                >
                  {todaysConges.map((conge, index) => {
                    return (
                      <div
                        key={`${conge.name}-${conge.startDate}`}
                        className={`element-container cursor-pointer px-2 py-1 flex flex-col w-full border-l-4 text-black`}
                        style={{
                          color: isSameMonth(day, date) ? 'black' : '#969696',
                          backgroundColor: isSameMonth(day, date) ? conge?.color + '50' : '#E3E3E3',
                          borderRadius: borderRadius,
                          borderLeftColor: isSameMonth(day, date) ? conge?.color : '#C0C0C0',
                        }}
                        onClick={() => handleItemClick(conge)}
                      >
                        <span
                          title={conge.name}
                          key={index}
                          className={`element-title ${style?.fontWeight ? style?.fontWeight : 'font-medium'} line-clamp-2`}
                        >
                          {conge.name}
                        </span>

                        <div key={`attributes-${index}`} className="element-detail flex flex-wrap">
                          {attributeList?.map((e) => {
                            return (
                              <span
                                key={`attribute-${index}-${e}`}
                                className={`attribute ${style?.fontSize ? style?.fontSize : 'text-sm'} basis-1/2 text-start`}
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
