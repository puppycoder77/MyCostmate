using System;
using System.Collections.Generic;
using System.Linq;

namespace CostMateAngular.Data.PuppyUtilities
{
    public static class UtilityMethods
    {
        public static string PupGetTotalDays(double preciseDay)
        {
            double precisedayToCeil = Math.Ceiling(preciseDay);

            if (precisedayToCeil == -1)
            {
                return "Yesterday";
            }

            if (precisedayToCeil == 0)
            {
                return "Today";
            }

            if (precisedayToCeil < -1)
            {
                return $"{precisedayToCeil} days ago";
            }

            return "Many days ago";
        }

        public static string PupGetMonthInString(double monthInDoubleFormat)
        {
            double monthInDoubleFormatToCeil = Math.Ceiling(monthInDoubleFormat);
            string monthAsString = "";

            if (monthInDoubleFormatToCeil == 1)
            {
                monthAsString = "January";
            }

            if (monthInDoubleFormatToCeil == 2)
            {
                monthAsString = "February";
            }

            if (monthInDoubleFormatToCeil == 3)
            {
                monthAsString = "March";
            }

            if (monthInDoubleFormatToCeil == 4)
            {
                monthAsString = "April";
            }

            if (monthInDoubleFormatToCeil == 5)
            {
                monthAsString = "May";
            }

            if (monthInDoubleFormatToCeil == 6)
            {
                monthAsString = "June";
            }

            if (monthInDoubleFormatToCeil == 7)
            {
                monthAsString = "July";
            }

            if (monthInDoubleFormatToCeil == 8)
            {
                monthAsString = "August";
            }

            if (monthInDoubleFormatToCeil == 9)
            {
                monthAsString = "September";
            }

            if (monthInDoubleFormatToCeil == 10)
            {
                monthAsString = "October";
            }

            if (monthInDoubleFormatToCeil == 11)
            {
                monthAsString = "November";
            }

            if (monthInDoubleFormatToCeil == 12)
            {
                monthAsString = "December";
            } 

            return monthAsString;
        }

        public static DateTime GetCurrentTime()
        {
            DateTime serverTime = DateTime.Now;
            DateTime _localTime = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(serverTime, TimeZoneInfo.Local.Id, "W. Central Africa Standard Time");
            return _localTime;
        }
    }
}