using System;

namespace CostMateAngular.Data.Entities
{
    public class UserMessage
    {
        public int Id { get; set; }
        public string Body { get; set; }
        public AppUser Sender { get; set; }
        public /*virtual*/ AppUser Receiver { get; set; }
        public int SenderId { get; set; }
        //public int ReceiverId { get; set; }
        public DateTime? DateSent { get; set; } = DateTime.Now;
        //public int MateItemId  { get; set; }
        public MateItem ForMateItem { get; set; }
        public bool HasBeenRead { get; set; }

        public string TitleExtractedFromItemTitle { get; set; }
    }
}