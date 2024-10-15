import {
  dateTo4DFormat,
  splitDatasourceID,
  useDataLoader,
  useRenderer,
  useSources,
  useWebformPath,
} from '@ws-ui/webform-editor';

import cn from 'classnames';
import { FC, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';
import { colorToHex, generateColorPalette, randomColor } from '../shared/colorUtils';
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
import { fr, es, de } from 'date-fns/locale';
import { updateEntity } from '../hooks/useDsChangeHandler';
import findIndex from 'lodash/findIndex';
import { cloneDeep } from 'lodash';

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
    sources: { datasource, currentElement: selectedElement },
  } = useSources();

  const [date, setDate] = useState(new Date());
  const [selDate, setSelDate] = useState(new Date());
  const hasMounted = useRef(false);
  const path = useWebformPath();

  const ds = useMemo(() => {
    if (datasource) {
      const clone: any = cloneDeep(datasource);
      clone.id = `${clone.id}_clone`;
      clone.children = {};
      return clone;
    }
    return null;
  }, [datasource?.id, (datasource as any)?.entitysel]);

  const attrs = useMemo(
    () => (ds?.dataclass ? Object.keys(ds.dataclass._private.attributes) : []),
    [ds],
  );

  let { entities, fetchIndex } = useDataLoader({ source: ds });

  const colorgenerated = useMemo(
    () => generateColorPalette(entities.length, ...colors.map((e) => e.color || randomColor())),
    [entities.length, colors],
  );

  let attributeList = attributes?.map((e) => e.Attribute);

  const monthQuery = useCallback(
    async (source: datasources.DataSource, newMonth: Date) => {
      if (!source) return;
      if (source.type === 'entitysel') {
        if (attrs.includes(startDate)) {
          const { entitysel } = source as any;
          const dataSetName = entitysel?.getServerRef();
          const queryStr = `${startDate} >= ${format(startOfWeek(startOfMonth(newMonth), { weekStartsOn: 1 }), 'yyyy-MM-dd')} AND ${startDate} <= ${format(endOfWeek(endOfMonth(newMonth), { weekStartsOn: 1 }), 'yyyy-MM-dd')}`;
          (source as any).entitysel = source.dataclass.query(queryStr, {
            dataSetName,
            filterAttributes: source.filterAttributesText || entitysel._private.filterAttributes,
          });
        } else {
          checkParams = `"${startDate}" does not exist as an attribute`;
        }
      }
      fetchIndex(0);
    },
    [ds, startDate],
  );

  let checkParams = useMemo(() => {
    if (!ds) {
      return 'Please set "Datasource"';
    } else if (!entities[0] || !entities.length) {
      return '';
    }
    if (!property) {
      return 'Please set "Property"';
    } else if (!attrs.includes(property)) {
      return `"${property}" does not exist as an attribute`;
    }
    if (!startDate) {
      return 'Please set the "Start Date"';
    } else if (!attrs.includes(startDate)) {
      return `"${startDate}" does not exist as an attribute`;
    }
    if (!endDate) {
      return 'Please set the "End Date"';
    } else if (!attrs.includes(endDate)) {
      return `"${endDate}" does not exist as an attribute`;
    }
    return '';
  }, [ds, entities, property, startDate, endDate]);

  // * Prevent onMonthChange from executing from the get-Go
  useEffect(() => {
    if (hasMounted.current) {
      emit('onMonthChange', { currentDate: date });
    } else {
      hasMounted.current = true;
    }
  }, [date]);

  useEffect(() => {
    if (date) monthQuery(ds, date);
  }, [date, ds]);

  const prevMonth = () => setDate(subMonths(date, 1));
  const nextMonth = () => setDate(addMonths(date, 1));
  const nextYear = () => setDate(addMonths(date, 12));
  const prevYear = () => setDate(subMonths(date, 12));

  // TODO : See if we can use something else other than "any"
  let coloredData = useMemo(
    () =>
      entities.map((obj: any, index) => ({
        ...obj,
        color: obj[colorProp] || colorgenerated[index],
        attributes: attributeList?.reduce((acc: { [key: string]: any }, e) => {
          acc[e] = obj[e];
          return acc;
        }, {}),
      })),
    [entities, colorgenerated, colorProp, attributeList],
  );

  const handleDateClick = async (value: Date) => {
    setSelDate(value);
    if (!selectedDate) return;
    const { id, namespace } = splitDatasourceID(selectedDate);
    const ds =
      window.DataSource.getSource(id, namespace) || window.DataSource.getSource(selectedDate, path);
    ds?.setValue(
      null,
      value instanceof Date && !isNaN(value.valueOf()) ? dateTo4DFormat(value) : value,
    );
    const ce = await ds?.getValue();
    emit('onDateClick', { selectedDate: ce });
  };

  const handleItemClick = async (item: any) => {
    if (!selectedElement) return;
    switch (selectedElement.type) {
      case 'scalar':
        selectedElement.setValue(null, item);
        emit('onItemClick', { selectedData: selectedElement });
        break;
      case 'entity':
        const index = findIndex(
          entities,
          (e: any) =>
            e[property] === item[property] &&
            e[startDate] === item[startDate] &&
            e[endDate] === item[endDate],
        );
        await updateEntity({ index, datasource: ds, currentElement: selectedElement });
        emit('onItemClick', { selectedData: selectedElement });
        break;
    }
  };

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
              const itemStartDate = new Date(item[startDate]);
              const itemEndDate = new Date(item[endDate]);
              return ds.type === 'scalar'
                ? day >= itemStartDate && day <= itemEndDate
                : day >= new Date(dateTo4DFormat(itemStartDate)) &&
                    day <= new Date(dateTo4DFormat(itemEndDate));
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
                      border: day === selDate ? `2px solid ${colorToHex(selectedColor)}` : '',
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
                  {data.map((item, index) => {
                    return (
                      <div
                        key={`${item[property]}-${item[startDate]}`}
                        className={`element-container cursor-pointer px-2 py-1 flex flex-col w-full border-l-4 text-black`}
                        style={{
                          color: isSameMonth(day, date) ? 'black' : '#969696',
                          backgroundColor: isSameMonth(day, date)
                            ? colorToHex(item?.color) + '50'
                            : '#E3E3E3',
                          borderRadius: borderRadius,
                          borderLeftColor: isSameMonth(day, date) ? item?.color : '#C0C0C0',
                        }}
                        onClick={() => handleItemClick(item)}
                      >
                        <span
                          title={item[property]}
                          key={index}
                          className={`element-title ${style?.fontWeight ? style?.fontWeight : 'font-medium'} line-clamp-2`}
                        >
                          {item[property]}
                        </span>

                        <div key={`attributes-${index}`} className="element-detail flex flex-wrap">
                          {attributeList?.map((e) => {
                            return (
                              <span
                                key={`attribute-${index}-${e}`}
                                className={`attribute ${style?.fontSize ? style?.fontSize : 'text-sm'} basis-1/2 text-start`}
                                title={item?.attributes[e]?.toString()}
                              >
                                {item.attributes[e]}
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
