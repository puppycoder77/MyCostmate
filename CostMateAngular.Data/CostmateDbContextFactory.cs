using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CostMateAngular.Data
{
    public class CostmateDbContextFactory : IDbContextFactory<CostmateDbContext>
    {
        public CostmateDbContext Create()
        {
            return new CostmateDbContext("Server=.\\sqlserver2012sec;Database=CostMateDb;Trusted_Connection=True;MultipleActiveResultSets=true");
        }
    }
}