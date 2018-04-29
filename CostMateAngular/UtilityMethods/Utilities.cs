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
        public static string MAILSERVERHOST { get { return "MAILSERVERHOST "; } }
        public static int MAILSERVERPORT { get { return 8899; } }
        public static string MAILSERVERUSERNAME { get { return "HIDDENMAILSERVERUSERNAME"; } }
        public static string MAILSERVERPASSWORD { get { return "HIDDENMAILSERVERPASSWORD"; } }
        public static string ADMINMAILADDRESS { get { return "HIDDENADMINMAILADDRESS"; } }
        public static string DISPLAYNAME { get { return "MyCostmate Team"; } }

        public static string MESSAGEFOOTER { get { return $"<br/><br/><span style='font-size:10px;color:#999;'>Copyright © {DateTime.Now.Year} MyCostmate Team, All rights reserved.</span>"; } }
        public static long MAX_FILE_SIZE { get  {return 10 * 1024 * 1024; } }
        public static string[] ACCEPTED_FILE_TYPES { get { return new[] { ".jpeg", ".jpg", ".png" }; } }
    }
}
