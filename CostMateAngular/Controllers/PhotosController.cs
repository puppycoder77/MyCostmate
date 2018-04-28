using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using CostMateAngular.Data;
using CostMateAngular.Data.Entities;
using Microsoft.AspNetCore.Http;

namespace CostMateAngular.Controllers
{
    [Route("api/[controller]")]
    [EnableCors("AnyVerb")]
    public class PhotosController : Controller
    {
        private CostmateDbContext _dbContext = null;
        public PhotosController(CostmateDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        #region PersonPhoto

        #endregion

        #region ItemPhoto
        [HttpPost]
        [Route("itemPhoto/{itemid}")]
        public void PostNewItemPhotos(int itemid, IFormFile file, IFormCollection frmcoll)
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            AppUser appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            MateItem ExistingmateItem = _dbContext.MateItems.Where(mi => mi.Id == itemid && mi.Owner == appUser).FirstOrDefault();
        }

        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        } 
        #endregion
    }
}
