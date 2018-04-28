using CostMateAngular.Data.Entities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CostMateAngular.Data
{
    public class CostmateDbContext : DbContext
    {
        public CostmateDbContext(string connString) : base(nameOrConnectionString: connString)
        {
            
        }

        public DbSet<MateItem> MateItems { get; set; }
        public DbSet<AppUser> AppUsers { get; set; }
        public DbSet<UserMessage> UserMessages { get; set; }
        public DbSet<Photo> Photos { get; set; }
    }
}
