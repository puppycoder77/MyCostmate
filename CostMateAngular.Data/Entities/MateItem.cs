using CostMateAngular.Data.PuppyUtilities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CostMateAngular.Data.Entities
{
    public class MateItem
    {
        public MateItem()
        {
            ItemPhotos = new List<Photo>();
            //Owner = new AppUser();
        }

        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public /*virtual*/ AppUser Owner { get; set; }
        public int AppUserId { get; set; }
        public string ItemState { get; set; }
        public string ItemCategory { get; set; }
        public bool Approved { get; set; }
        public bool ShowOnHomePage { get; set; }
        public int ViewCount { get; set; } = 0;
        public DateTime? DatePosted { get; set; } = UtilityMethods.GetCurrentTime();
        //public DateTime? DatePosted { get; set; } = DateTime.Now;
        public virtual List<Photo> ItemPhotos { get; set; }

        [NotMapped]
        public IFormFile FirstImage { get; set; }
        [NotMapped]
        public IFormFile SecondImage { get; set; }
        [NotMapped]
        public IFormFile ThirdImage { get; set; }

        //Manipulated Properties
        public string DatePostedStringified =>
            $"{UtilityMethods.PupGetTotalDays(DatePosted.Value.Subtract(DateTime.Now).TotalDays).Replace("-", "")}";

        public string SubGroupStringified => $"Other {ItemCategory}s in {ItemState}";
        public List<string> ListForRelatedLink => new List<string> { ItemCategory, ItemState };
    }
}








