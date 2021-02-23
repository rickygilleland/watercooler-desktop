import { DateTime } from "luxon";
import { useEffect, useState } from "react";

export const useGetCurrentTime = (timezone: string): DateTime => {
  const [currentTime, setCurrentTime] = useState(DateTime.local());

  useEffect(() => {
    const timeInterval = setInterval(function () {
      const updatedCurrentTime = DateTime.local();
      if (
        updatedCurrentTime
          .setZone(timezone)
          .toLocaleString(DateTime.TIME_SIMPLE) !==
        currentTime.setZone(timezone).toLocaleString(DateTime.TIME_SIMPLE)
      ) {
        setCurrentTime(updatedCurrentTime);
      }
    }, 1000);

    return () => {
      if (timeInterval) {
        clearInterval(timeInterval);
      }
    };
  }, [currentTime, timezone]);

  return currentTime;
};
