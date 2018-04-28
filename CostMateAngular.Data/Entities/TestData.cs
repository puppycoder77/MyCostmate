using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CostMateAngular.Data.Entities
{
    public class TestData
    {
        public string Purpose { get; set; }
        public bool Fulfilled { get; set; }
        public IFormFile FirstImage { get; set; }
        public IFormFile SecondImage { get; set; }
        public IFormFile ThirdImage { get; set; }
    }
}
