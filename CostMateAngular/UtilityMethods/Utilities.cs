using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Linq;
using System.Threading.Tasks;

namespace CostMateAngular.UtilityMethods
{
    public static class Utilities
    {
        public static string MAILSERVERHOST { get; } = "MAILSERVERHOST ";
        public static int MAILSERVERPORT { get; } = 8899;
        public static string MAILSERVERUSERNAME { get; } = "HIDDENMAILSERVERUSERNAME";
        public static string MAILSERVERPASSWORD { get; } = "HIDDENMAILSERVERPASSWORD";
        public static string ADMINMAILADDRESS { get; } = "HIDDENADMINMAILADDRESS";
        public static string DISPLAYNAME { get; } = "MyCostmate Team";

        public static string MESSAGEFOOTER { get; } = $"<br/><br/><span style='font-size:10px;color:#999;'>Copyright © {DateTime.Now.Year} MyCostmate Team, All rights reserved.</span>";
        public static long MAX_FILE_SIZE { get; } = 10 * 1024 * 1024;
        public static string[] ACCEPTED_FILE_TYPES { get; } = new[] { ".jpeg", ".jpg", ".png" };

        
    }
}
