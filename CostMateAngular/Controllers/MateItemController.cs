using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CostMateAngular.Data;
using CostMateAngular.Data.Entities;
using System.Data.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Drawing;
using CostMateAngular.PuppyExtensions;
using System.Net.Mail;
using CostMateAngular.UtilityMethods;

namespace CostMateAngular.Controllers
{
    [Route("api/[controller]")]
    public class MateItemController : Controller
    {
        private CostmateDbContext _dbContext = null;
        public IHostingEnvironment _hostingEnv { get; }

        public MateItemController(CostmateDbContext dbContext, IHostingEnvironment hostingEnvironment)
        {
            _dbContext = dbContext;
            _hostingEnv = hostingEnvironment;

           
        }

        [HttpGet]
        public IActionResult Get()
        {
            var mateItems = _dbContext.MateItems.Where(mi=>mi.Approved && mi.ShowOnHomePage).OrderByDescending(mi=>mi.DatePosted).ToList();

            var firstItem = mateItems.FirstOrDefault();
            var dummynextTwoItems = mateItems.Skip(1).Take(4).ToList();
            var dummyTrending = mateItems.Skip(5).Take(3).ToList();

            var homePageItems = new
            {
                firstItem,
                dummynextTwoItems,
                dummyTrending
            };

            return Ok(homePageItems);
            
        }

        [HttpPost]
        [Authorize]
        public IActionResult Post(MateItem mateItem)
        {
            MateItem newmateItem = mateItem;

            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            AppUser appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            var uploadsFolderPath = Path.Combine(_hostingEnv.WebRootPath, "Uploads");
            if (!Directory.Exists(uploadsFolderPath))
            {
                Directory.CreateDirectory(uploadsFolderPath);
            }

            //DONE: Find how to reduce file size(width & height), so that it will not have problem with xamarin Image control later.

            List<IFormFile> frmfiles = new List<IFormFile>();

            if (mateItem.FirstImage != null && mateItem.FirstImage.Length > 0 && mateItem.FirstImage.Length < Utilities.MAX_FILE_SIZE)
            {
                if (Utilities.ACCEPTED_FILE_TYPES.Any(s => s == Path.GetExtension(mateItem.FirstImage.FileName)))
                {
                    frmfiles.Add(mateItem.FirstImage);
                }
            }
            if (mateItem.SecondImage != null && mateItem.SecondImage.Length > 0 && mateItem.SecondImage.Length < Utilities.MAX_FILE_SIZE)
            {
                if (Utilities.ACCEPTED_FILE_TYPES.Any(s => s == Path.GetExtension(mateItem.SecondImage.FileName)))
                {
                    frmfiles.Add(mateItem.SecondImage);
                }
            }
            if (mateItem.ThirdImage != null && mateItem.ThirdImage.Length > 0 && mateItem.ThirdImage.Length < Utilities.MAX_FILE_SIZE)
            {
                if (Utilities.ACCEPTED_FILE_TYPES.Any(s => s == Path.GetExtension(mateItem.ThirdImage.FileName)))
                {
                    frmfiles.Add(mateItem.ThirdImage);
                }
            }

            if (frmfiles.Count > 0)
            {
                foreach (var item in frmfiles)
                {
                    var firstImgFileName = Guid.NewGuid().ToString() + Path.GetExtension(item.FileName);
                    var firstImgfilePath = Path.Combine(uploadsFolderPath, firstImgFileName);

                    using (var img = Image.FromStream(item.OpenReadStream()))
                    {
                        Stream memStrm = new MemoryStream(img.Resize(300, 200).ToByteArray());
                        var filestrmRes = new FileStreamResult(memStrm, "image/jpg");
                        var stream = new FileStream(firstImgfilePath, FileMode.Create);
                        try
                        {
                            memStrm.CopyTo(stream);
                            //filestrmRes.FileStream.CopyTo(memStrm);
                        }
                        finally
                        {
                            stream.Dispose();
                        }
                    }

                    var newPhoto = new Photo
                    {
                        Filename = firstImgFileName
                    };

                    newmateItem.ItemPhotos.Add(newPhoto);
                }
            }

            if (!ModelState.IsValid)
            {
                return BadRequest("Submitted wrong data!");
            }

            newmateItem.AppUserId = appUser.Id;
            //A bit redundant but the normal way is not working!!!
            newmateItem.Owner = _dbContext.AppUsers.Where(appusr => appusr.Id == newmateItem.AppUserId).FirstOrDefault();
            _dbContext.MateItems.Add(newmateItem);

            //appUser.Items.Add(newmateItem);
            _dbContext.SaveChanges();

            string newUri = Url.Link("GetMateItem", new { itemState = mateItem.ItemState, itemcategory = mateItem.ItemCategory, id = mateItem.Id });

            /////////////////////Now send mail to admin(Puppy), notifying him to go and approve the new post //////////////////////////
            NotifyAdminAndPostOwnerOfNewPost(newmateItem);
            ///////////////////End of send mail to admin(Puppy), notifying him to go and approve the new post///////////////////////

            return Created(newUri, mateItem);
            //return Ok(mateItem);
        }

        private void NotifyAdminAndPostOwnerOfNewPost(MateItem newmateItem)
        {
           
            MailAddress AdminAddress = new MailAddress(Utilities.ADMINMAILADDRESS);
            MailAddress AdOwnerAddress = new MailAddress(newmateItem.Owner.Email);

            var newPostLink = $"{Request.Scheme}://{Request.Host}/state/{newmateItem.ItemState}/{newmateItem.ItemCategory}/{newmateItem.Id}";

            using (SmtpClient smtpClient = new SmtpClient(Utilities.MAILSERVERHOST, Utilities.MAILSERVERPORT))
            {
                smtpClient.Credentials = new System.Net.NetworkCredential(Utilities.MAILSERVERUSERNAME, Utilities.MAILSERVERPASSWORD);
                smtpClient.Timeout = 2000000;
                using (MailMessage msg = new MailMessage())
                {
                    msg.From = new MailAddress(Utilities.MAILSERVERUSERNAME, Utilities.DISPLAYNAME);
                    msg.IsBodyHtml = true;
                    msg.To.Add(AdminAddress);
                    msg.Subject = "Admin there is a new post to confirm";
                    msg.Body = $"Admin<br/><br/><a href={newPostLink}>{newPostLink}</a><br /><br /> is waiting for your confirmation{Utilities.MESSAGEFOOTER}";
                    smtpClient.Send(msg);  
                }

                using (MailMessage msg2 = new MailMessage())
                {
                    msg2.From = new MailAddress(Utilities.MAILSERVERUSERNAME, Utilities.DISPLAYNAME);
                    msg2.IsBodyHtml = true;
                    msg2.To.Add(AdOwnerAddress);
                    msg2.Bcc.Add(AdminAddress);
                    msg2.Subject = $"Your ad  {newmateItem.Title} has been received and  is under review";
                    msg2.Body = $"Hi {newmateItem.Owner.Firstname},<br/><br/> We are reviewing your ad <b>{newmateItem.Title}</b> and will have it approved and published if it passes neccesary checks.{Utilities.MESSAGEFOOTER}";

                    smtpClient.Send(msg2);
                }
            }
        }

        /////////////LOOKS LIKE THIS PUT METHOD IS NOT DOING ANYTHING(If not useful, then delete), THE METHOD THAT IS UPDATING USER POST IS LOCATED AT APPUSERMANAGERCONTROLLER(EditSpecificUserPost)////////////////////////////////////////
        [HttpPut("{id}")]
        [Authorize]
        public IActionResult Put(int id, [FromBody] MateItem mateItem)
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            AppUser appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            MateItem ExistingmateItem = _dbContext.MateItems.Where(mi => mi.Id == id && mi.Owner == appUser).FirstOrDefault();

            if (ExistingmateItem == null)
            {
                return NotFound($"Could not found an item you are looking for(Are you sure you are the owner of the item?)");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest("Submitted wrong data!");
            }

            ////////////////////////////////////////////////////////////////////////////////////////   
            ExistingmateItem.Title = mateItem.Title ?? ExistingmateItem.Title;
            ExistingmateItem.Description = mateItem.Description ?? ExistingmateItem.Description;
            ExistingmateItem.ItemCategory = mateItem.ItemCategory ?? ExistingmateItem.ItemCategory;
            ExistingmateItem.ItemState = mateItem.ItemState ?? ExistingmateItem.ItemState;
            ExistingmateItem.Owner = mateItem.Owner ?? ExistingmateItem.Owner;
            ///////////////////////////////////////////////////////////////////////////////////////

            _dbContext.Entry(ExistingmateItem).State = EntityState.Modified;
            _dbContext.SaveChanges();

            string newUri = Url.Link("GetMateItem", new { id = ExistingmateItem.Id });

            return Created(newUri, ExistingmateItem);
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            AppUser appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            MateItem ExistingmateItem = _dbContext.MateItems.Where(mi => mi.Id == id && mi.Owner == appUser).FirstOrDefault();

            if (ExistingmateItem == null)
            {
                return NotFound($"Could not found an item you are looking for(Are you sure you are the owner of the item?)");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest("Submitted wrong data!");
            }

            //_dbContext.MateItems.Remove(ExistingmateItem);
            _dbContext.Entry(ExistingmateItem).State = EntityState.Deleted;
            //_dbContext.SaveChanges();
            await _dbContext.SaveChangesAsync();

            return Ok("Data deleted!");
        }

        [Route("searchbar/{srchContent}")]
        public IActionResult GetItemBySearchbarContent(string srchContent)
        {
            var mateItems = _dbContext.MateItems.Where(mi => mi.Title.Contains(srchContent)).ToList();
            return Ok(mateItems);
        }

        #region ByState
        [Route("state/{itemState}")]
        public IActionResult GetItemByState(string itemState)
        {
            List<MateItem> mateItems = _dbContext.MateItems.Where(mi => mi.ItemState == itemState).ToList();

            if (mateItems.Count == 0)
            {
                return NotFound($"Could not found any item that matches your search");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest("Submitted wrong data!");
            }

            return Ok(mateItems);
        }

        [Route("state/{itemState}/{itemcategory}")]
        public IActionResult GetItemByStateAndCategory(string itemState, string itemcategory)
        {
            List<MateItem> mateItems = _dbContext.MateItems.Where(mi => mi.ItemState == itemState && mi.ItemCategory == itemcategory).ToList();

            if (mateItems.Count == 0)
            {
                return NotFound($"Could not found any item that matches your search");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest("Submitted wrong data!");
            }

            return Ok(mateItems);
        }

        [Route("state/{itemState}/{itemcategory}/{id}", Name = "GetMateItem")]
        public IActionResult GetItemByStateCategoryAndId(string itemState, string itemcategory, int id)
        {
            var currentUserDetails = new object();

            if (User.Identity.IsAuthenticated)
            {
                var userClaims = User.Claims;
                var UserUniqueId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault();

                currentUserDetails = new
                {
                    isUserAuth = User.Identity.IsAuthenticated,
                    uniqueId = UserUniqueId.Value,
                    //Check whether the current user requesting this data is an admin, neat logic. Puppy stark!!!
                    isUserAdmin = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserUniqueId.Value).FirstOrDefault().IsAdmin
                }; 
            }

            else
            {
                currentUserDetails = null;
            }

            //var isUserAuth = User.Identity.IsAuthenticated;

            MateItem mainMateItem = _dbContext.MateItems.Where(mi => mi.ItemState == itemState && mi.ItemCategory == itemcategory && mi.Id == id).FirstOrDefault();

            if (mainMateItem == null)
            {
                return NotFound($"Could not found any item that matches your search");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest("Submitted wrong data!");
            }

            //TDOD:Find a solution to this Owner always beig null and end the proccess of manually assigning owner to MateItem.
            mainMateItem.Owner = _dbContext.AppUsers.Where(appuser => appuser.Id == mainMateItem.AppUserId).FirstOrDefault();

            List<MateItem> otherMateItemsByOwner = _dbContext.MateItems.Where(mi => mi.AppUserId == mainMateItem.Owner.Id && mi.Id != mainMateItem.Id).ToList();
            ManuallyAssignOwnerToRelatedItems(mainMateItem, otherMateItemsByOwner);

            List<MateItem> otherMateItemsWithSameCatAndState = _dbContext.MateItems.Where(mi => mi.ItemCategory == mainMateItem.ItemCategory && mi.ItemState == mainMateItem.ItemState && mi.Id != mainMateItem.Id).ToList();
            ManuallyAssignOwnerToRelatedItems(mainMateItem, otherMateItemsWithSameCatAndState);

            mainMateItem.ViewCount++; //Increase the view count.
            _dbContext.SaveChanges(); //Save the increased number to database.

            var mateItemWithRelatedObjects = new
            {
                mainMateItem,
                otherMateItemsByOwner,
                otherMateItemsWithSameCatAndState,
                currentUserDetails
            };

            return Ok(mateItemWithRelatedObjects);
        }

        private static void ManuallyAssignOwnerToRelatedItems(MateItem foundMateItem, List<MateItem> relatedItems)
        {
            if (relatedItems.Count > 0)
            {
                foreach (var item in relatedItems)
                {
                    item.Owner = foundMateItem.Owner;
                }
            }
        }
        #endregion

        [HttpPost]
        [Authorize]
        [Route("approvePost/{approveordisapprove}/{postId}")]
        public IActionResult ApproveOrDisapprovePost(int approveordisapprove, int postId)
        {
            var currentUserDetails = new object();

            if (User.Identity.IsAuthenticated)
            {
                var userClaims = User.Claims;
                var UserUniqueId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault();

                //Get the user making this request.
                var userMakingThisRequest = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserUniqueId.Value).FirstOrDefault();

                //If the user making this request is an Admin
                if (userMakingThisRequest.IsAdmin)
                {
                    var mateItemToChangeItsApprovedState = _dbContext.MateItems.Where(mi => mi.Id == postId).Include("Owner").FirstOrDefault();
                    if (mateItemToChangeItsApprovedState != null)
                    {
                        string approvedornotMessage;

                        if (approveordisapprove == 1)
                        {

                            mateItemToChangeItsApprovedState.Approved = true;
                            approvedornotMessage = "Item succesfully Approved";

                            //Send email to the user that his post has been approved.
                            NotifyPostOwnerAndAdminOfApprovalState(mateItemToChangeItsApprovedState, approveordisapprove);
                            //End of sending email to the user that his post has been approved.
                        }
                        else
                        {
                            mateItemToChangeItsApprovedState.Approved = false;
                            approvedornotMessage = "Item succesfully Dispproved";

                            //Send email to the user that his post has been approved.
                            NotifyPostOwnerAndAdminOfApprovalState(mateItemToChangeItsApprovedState, approveordisapprove);
                            //End of sending email to the user that his post has been approved.
                        }
                        _dbContext.SaveChanges();

                        var apres = new { msg = approvedornotMessage };

                        return Ok(apres);
                    }
                }
                return Unauthorized();
            }

            return Unauthorized();
        }

        private void NotifyPostOwnerAndAdminOfApprovalState(MateItem mateItemToChangeItsApprovedState, int approvalStateId)
        {
            var adOwnerEmailAddress = mateItemToChangeItsApprovedState.Owner.Email;
            using (SmtpClient smtpClient = new SmtpClient(Utilities.MAILSERVERHOST, Utilities.MAILSERVERPORT))
            {
                smtpClient.Credentials = new System.Net.NetworkCredential(Utilities.MAILSERVERUSERNAME, Utilities.MAILSERVERPASSWORD);
                smtpClient.Timeout = 2000000;

                using (MailMessage msg = new MailMessage())
                {
                    MailAddress adOwnerAddress = new MailAddress(adOwnerEmailAddress);
                    MailAddress AdminAddress = new MailAddress(Utilities.ADMINMAILADDRESS);

                    msg.To.Add(adOwnerAddress);
                    msg.Bcc.Add(AdminAddress);
                    msg.From = new MailAddress(Utilities.MAILSERVERUSERNAME, Utilities.DISPLAYNAME);
                    msg.IsBodyHtml = true;


                    //$"{this.Request.Scheme}://{this.Request.MAILSERVERHOST} 
                    var newPostLink = $"{Request.Scheme}://{Request.Host}/state/{mateItemToChangeItsApprovedState.ItemState}/{mateItemToChangeItsApprovedState.ItemCategory}/{mateItemToChangeItsApprovedState.Id}";



                    if (approvalStateId == 1)
                    {
                        msg.Subject = $"Your ad {mateItemToChangeItsApprovedState.Title} has been approved";
                        msg.Body = $"Congratulation your ad <a href={newPostLink}>{mateItemToChangeItsApprovedState.Title}</a> has been approved{Utilities.MESSAGEFOOTER}";
                    }
                    else
                    {
                        msg.Subject = $"Your ad {mateItemToChangeItsApprovedState.Title} has been disapproved";
                        msg.Body = $"Your ad <a href={newPostLink}>{mateItemToChangeItsApprovedState.Title}</a><br /> contains somed unwanted contents and has been disapproved{Utilities.MESSAGEFOOTER}";
                    }

                    //smtpClient.EnableSsl = true;
                    smtpClient.Send(msg);
                }
            }
        }


        #region MethodForSearchBar
        [Route("matchedword/{word}")]
        public IActionResult GetItemsContainingWord(string word)
        {
            List<MateItem> mateItems = _dbContext.MateItems.Where(mi => mi.Title.Contains(word)).ToList();

            if (mateItems.Count == 0)
            {
                return NotFound($"Could not found any item that matches your search");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest("Submitted wrong data!");
            }

            return Ok(mateItems);
        }
        #endregion

        #region Photomanagement

        #endregion
    }
}
