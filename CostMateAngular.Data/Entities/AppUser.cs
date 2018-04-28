using CostMateAngular.Data.PuppyUtilities;
using System;
using System.Collections.Generic;

namespace CostMateAngular.Data.Entities
{
    public class AppUser
    {
        public int Id { get; set; }
        public bool IsAdmin { get; set; }
        public string Firstname { get; set; }
        public string Lastname { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string PhotoUrl { get; set; }
        public /*virtual*/ List<UserMessage> Messages { get; set; }
        public /*virtual*/ List<MateItem> Items { get; set; }
        //public string Country { get; set; }
        public string State { get; set; }
        public DateTime? DateRegistered { get; set; } = UtilityMethods.GetCurrentTime();
        //public DateTime? DateRegistered { get; set; } = DateTime.Now;

        //Concanated Properties
        public string Fullname => $"{Firstname} {Lastname}";

        //Manipulated Properties
        public string DateRegisteredStringified => $"{UtilityMethods.PupGetTotalDays(DateRegistered.Value.Subtract(DateTime.Now).TotalDays).Replace("-", "")}";

        public string UniqueId { get; set; }
    }
}