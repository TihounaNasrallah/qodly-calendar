export default function Spinner() {
  return (
    <div className="calendar-spinner absolute bg-white opacity-70 flex-col gap-4 w-full h-full flex items-center justify-center ">
      <div className="calendar-outer-spinner relative w-20 h-20 border-4 border-transparent text-4xl animate-spin flex items-center justify-center border-t-indigo-700 rounded-full">
        <div className="calendar-inner-spinner relative w-16 h-16 border-4 border-transparent text-2xl animate-spin flex items-center justify-center border-t-indigo-400 rounded-full"></div>
      </div>
    </div>
  );
}
