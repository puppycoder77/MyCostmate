using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CostMateAngular.Data.Entities;
using CostMateAngular.Data;
using System.Data.Entity;

namespace CostMateAngular.Controllers
{
    [Route("api/[controller]/user/{userUniqueId}")]
    public class AppUserItemsController : Controller
    {
        private CostmateDbContext _dbContext = null;

        public AppUserItemsController(CostmateDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/values
        [HttpGet]
        public IActionResult Get()
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;

            return null;
        }

        // GET api/values/5
        [HttpGet("{itemId}")]
        public string Get(string userUniqueId,int itemId)
        {
            return "value";
        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
