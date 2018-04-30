using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CostMateAngular.Data;
using CostMateAngular.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Data.Entity;
using Microsoft.AspNetCore.Http;
using System.Drawing;
using CostMateAngular.PuppyExtensions;
using System.Net.Mail;
using CostMateAngular.UtilityMethods;

namespace CostMateAngular.Controllers
{
    [Route("api/[controller]")]
    public class AppUserManagerController : Controller
    {
        private readonly CostmateDbContext _dbContext;
        public IHostingEnvironment _hostingEnv { get; }

        public AppUserManagerController(CostmateDbContext dbContext, IHostingEnvironment hostingEnvironment)
        {
            _dbContext = dbContext;
            _hostingEnv = hostingEnvironment;
        }

        //[Authorize]
        [Route("user")]
        public IActionResult GetUser()
        {
            if (User == null)
            {
                return NotFound("User not found");
            }

            if (User.Claims.Count()== 0)
            {
                return NotFound("User not found");
            }

            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            AppUser appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            return Ok(appUser);
        }

        [HttpPost]//Grab the new firebase user and use it to create new AppUser
        //[Authorize]
        public void Post([FromBody]AppUser appUser)
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            appUser.UniqueId = UserId;

            _dbContext.AppUsers.Add(appUser);
            _dbContext.SaveChanges();
        }

        [Authorize]
        [HttpPost]
        [Route("userProfile/editUserPic")]
        public IActionResult PostUserPic(IFormFile userImageVal)
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            AppUser appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            var uploadsFolderPath = Path.Combine(_hostingEnv.WebRootPath, "Uploads/UserPics");
            if (!Directory.Exists(uploadsFolderPath))
            {
                Directory.CreateDirectory(uploadsFolderPath);
            }

            if (userImageVal != null && userImageVal.Length > 0 && userImageVal.Length < Utilities.MAX_FILE_SIZE)
            {
                if (Utilities.ACCEPTED_FILE_TYPES.Any(s => s == Path.GetExtension(userImageVal.FileName)))
                {
                        var firstImgFileName = Guid.NewGuid().ToString() + Path.GetExtension(userImageVal.FileName);
                        var firstImgfilePath = Path.Combine(uploadsFolderPath, firstImgFileName);

                        using (var img = Image.FromStream(userImageVal.OpenReadStream()))
                        {
                            Stream memStrm = new MemoryStream(img.Resize(100, 100).ToByteArray());
                            var filestrmRes = new FileStreamResult(memStrm, "image/jpg");
                            var stream = new FileStream(firstImgfilePath, FileMode.Create);
                            try
                            {
                                memStrm.CopyTo(stream);
                            }
                            finally
                            {
                                stream.Dispose();
                            }
                        }

                    appUser.PhotoUrl = firstImgFileName;
                }
            }

            var confirmWorking = new
            {
                infoMsg = "Profile Photo Successfully Changed."
            };

            _dbContext.SaveChanges();

            return Ok(confirmWorking);
        }

        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

        #region User Message Zone
        [Authorize]
        [HttpPost]
        [Route("user/sendMsg/{mateItemId}/{receiverId}/{msgType}")]
        public IActionResult SendMessageToUser([FromBody]UserMessage msg, int mateItemId, int receiverId, string msgType)
        {
            if (User == null)
            {
                return NotFound("Sender is not logged in, check your internet connection.");
            }
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            //int senderId = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault().Id;
            AppUser sender = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();
            AppUser receiver = _dbContext.AppUsers.Where(appusr => appusr.Id == receiverId).FirstOrDefault();
            MateItem miMsgOwner = _dbContext.MateItems.Where(mi => mi.Id == mateItemId).FirstOrDefault();
            //AppUser appUserReceiver = _dbContext.AppUsers.Where(appusr => appusr.Id == receiverId).FirstOrDefault();

            if (!ModelState.IsValid)
            {
                return BadRequest("Message content is in a bad format!");
            }
            msg.Sender = sender;
            msg.Receiver = receiver;
            msg.ForMateItem = miMsgOwner;
            msg.SenderId = sender.Id;
            msg.TitleExtractedFromItemTitle = $"Re:{miMsgOwner.Title}";

            //receiver.Messages.Add(msg);
            _dbContext.UserMessages.Add(msg);
            _dbContext.SaveChanges();

            string mateItemTitle = _dbContext.MateItems.Find(mateItemId).Title;
            //Send email to the receiver of this message.
            using (SmtpClient smtpClient = new SmtpClient(Utilities.MAILSERVERHOST, Utilities.MAILSERVERPORT))
            {
                smtpClient.Credentials = new System.Net.NetworkCredential(Utilities.MAILSERVERUSERNAME, Utilities.MAILSERVERPASSWORD);
                smtpClient.Timeout = 2000000;
                using (MailMessage mailMsg = new MailMessage())
                {
                    mailMsg.From = new MailAddress(Utilities.MAILSERVERUSERNAME, Utilities.DISPLAYNAME);
                    mailMsg.IsBodyHtml = true;
                    mailMsg.To.Add(receiver.Email);
                    if (msgType == "new")
                    {
                        mailMsg.Subject = "You have a new message";
                        mailMsg.Body = $"{sender.Firstname} {sender.Lastname} contacted you for the ad <b>{mateItemTitle}</b>. <br/><br/>Login to your dashboard to read the message{Utilities.MESSAGEFOOTER}"; 
                    }
                    else
                    {
                        mailMsg.Subject = $"{sender.Firstname} {sender.Lastname} has replied your message";
                        mailMsg.Body = $"{sender.Firstname} {sender.Lastname} has replied your message for ad <b>{mateItemTitle}</b>. <br/><br/>Login to your dashboard to read the message{Utilities.MESSAGEFOOTER}";
                    }

                    smtpClient.Send(mailMsg);
                }
            }

            return Ok("Message sent successfully");
        }

        [Authorize]
        [Route("user/getMsgList")]
        public IActionResult GetUserMessages()
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            var appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            List<UserMessage> userMsgs = _dbContext.UserMessages.Include(au=>au.Sender).Where(usrmsg => usrmsg.Receiver.Id == appUser.Id).ToList();

            return Ok(userMsgs);
        }

        [Authorize]
        [Route("user/getSpecificMsg/{msgId}")]
        public IActionResult GetSpecificUserMessages(int msgId)
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            var appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            UserMessage userMsg = _dbContext.UserMessages.Include(mi=>mi.ForMateItem).Include(au=>au.Sender).Where(usrmsg => usrmsg.Receiver.Id == appUser.Id && usrmsg.Id == msgId).FirstOrDefault();

            //We have reached this far that means the user is viewing the message(reading it), so:
            userMsg.HasBeenRead = true;
            //userMsg.ForMateItem = _dbContext.MateItems.Where(mi => mi.Id == userMsg.ForMateItem.Id).FirstOrDefault();
            _dbContext.SaveChanges();

            return Ok(userMsg);
        }


        [Authorize]
        [HttpDelete]
        [Route("user/deleteSpecificMsg/{msgId}")]
        public IActionResult DeleteSpecificUserMessage(int msgId)
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            var appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            UserMessage userMsg = _dbContext.UserMessages.Where(usrmsg => usrmsg.Receiver.Id == appUser.Id && usrmsg.Id == msgId).FirstOrDefault();

            userMsg.Sender = _dbContext.AppUsers.Where(appuser => appuser.Id == userMsg.SenderId).FirstOrDefault();

            _dbContext.UserMessages.Remove(userMsg);
            _dbContext.SaveChanges();

            return Ok("Message deleted");
        }

        /************************************SENT MESSAGE ZONE****************************************************/
        [Authorize]
        [Route("user/getSentMsgList")]
        public IActionResult GetUserSentMessages()
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            var appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            List<UserMessage> userMsgs = _dbContext.UserMessages.Include(au => au.Sender).Include(au => au.Receiver).Include(au => au.ForMateItem).Where(usrmsg => usrmsg.Sender.Id == appUser.Id).ToList();

            return Ok(userMsgs);
        }

        [Authorize]
        [Route("user/getSpecificSentMsg/{msgId}")]
        public IActionResult GetSpecificUserSentMessage(int msgId)
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            var appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            UserMessage userMsg = _dbContext.UserMessages.Include(mi => mi.ForMateItem).Include(au => au.Receiver).Where(usrmsg => usrmsg.Sender.Id == appUser.Id && usrmsg.Id == msgId).FirstOrDefault();

            _dbContext.SaveChanges();

            return Ok(userMsg);
        }
        /************************************END OF SENT MESSAGE ZONE****************************************************/
        #endregion

        #region User posts zone
        [Authorize]
        [Route("user/getSpecificUserPosts")]
        public IActionResult GetSpecificUserPosts()
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            var appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            List<MateItem> mateItems = _dbContext.MateItems.Where(mi => mi.AppUserId == appUser.Id).ToList();

            return Ok(mateItems);
        }

        [Authorize]
        [Route("user/getSpecificUserPosts/{mateItemId}")]
        public IActionResult GetSpecificUserPost(int mateItemId)
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            var appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            MateItem mateItem = _dbContext.MateItems.Where(mi => mi.AppUserId == appUser.Id && mi.Id == mateItemId).FirstOrDefault();

            return Ok(mateItem);
        }

        [Authorize]
        [HttpPut]
        [Route("user/editSpecificUserPosts/{mateItemId}")]
        public IActionResult EditSpecificUserPost(int mateItemId, MateItem mateItem)
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            var appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            MateItem ExistingmateItem = _dbContext.MateItems.Where(mi => mi.AppUserId == appUser.Id && mi.Id == mateItemId).FirstOrDefault();
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

            //The user has tamperded with his ad, so set it's approved property to false until it has been thorougly checked.
            ExistingmateItem.Approved = false;


            //////////////Now new photos----------Insert them--------//////////////////////////////
            var uploadsFolderPath = Path.Combine(_hostingEnv.WebRootPath, "Uploads");
            if (!Directory.Exists(uploadsFolderPath))
            {
                Directory.CreateDirectory(uploadsFolderPath);
            }

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
                    //using (var stream = new FileStream(firstImgfilePath, FileMode.Create))
                    //{
                    //    item.CopyTo(stream);
                    //}

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

                    ExistingmateItem.ItemPhotos.Add(newPhoto);
                }
            }

            ///////////////////////////////////////////////////////////////////////////////////////

            _dbContext.Entry(ExistingmateItem).State = EntityState.Modified;
             _dbContext.SaveChanges();

            //Send email to the user and inform him that his ad has been disabled while update to his ad is beign inspected, and will be enabled if it passes necessary inspection. Also notify the admin to check and approve/dissaprove this post.
            NotifyAdminAndPostOwnerOfUpdatedPost(ExistingmateItem);

            return Ok(ExistingmateItem);

            //string newUri = Url.Link("GetMateItem", new { id = ExistingmateItem.Id });
            //return Created(newUri, ExistingmateItem);
        }

        [Authorize]
        [HttpDelete]
        [Route("user/deleteSpecificUserPost/{mateItemId}")]
        public IActionResult DeleteSpecificUserPost(int mateItemId)
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            var appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            MateItem mateItem = _dbContext.MateItems.Where(mi => mi.AppUserId == appUser.Id && mi.Id == mateItemId).FirstOrDefault();

            //Get the photos related to this MateItem
            List<Photo> photos = _dbContext.Photos.ToList();
            foreach (var item in photos)
            {
                if (mateItem.ItemPhotos.Any(itmph => itmph.Id == item.Id))
                {
                    //First remove the Images of this removed photo
                    System.IO.File.Delete(Path.Combine(_hostingEnv.WebRootPath, $"Uploads/{item.Filename}"));
                    //Then
                    _dbContext.Photos.Remove(item);
                }
            }

            ////TODO:Also remove saved items with this mateItem.Id(This SavedItems class does not exist yet, create it.)
            //List<MateItem> savedMateItems = _dbContext.SavedItems.Where(svditms => svditms.MateItemId == mateItem.Id).ToList();
            //_dbContext.SavedEvents.RemoveRange(savedMateItems);

            _dbContext.MateItems.Remove(mateItem);
            _dbContext.SaveChanges();

            var msg = new
            {
                delmsg = $"Successfully removed {mateItem.Title}"
            };

            return Ok(msg);
        }

        [Authorize]
        [Route("user/deleteSpecificImgFromPost/{photoId}")]
        public IActionResult DeleteSpecificImgFromPost(int photoId)
        {
            var userClaims = User.Claims;
            var UserId = userClaims.Where(cl => cl.Type == "user_id").FirstOrDefault().Value;
            var appUser = _dbContext.AppUsers.Where(appusr => appusr.UniqueId == UserId).FirstOrDefault();

            //List<MateItem> mateItems = _dbContext.MateItems.Where(mi => mi.AppUserId == appUser.Id).ToList();
            Photo photo = _dbContext.Photos.Where(ph => ph.Id == photoId).FirstOrDefault();
            System.IO.File.Delete(Path.Combine(_hostingEnv.WebRootPath, $"Uploads/{photo.Filename}"));
            _dbContext.Photos.Remove(photo);
            _dbContext.SaveChanges();

            var msg = new
            {
                delmsg="Photo deleted"
            };

            return Ok(msg);
        }
        #endregion

        #region Helper Methods
        private void NotifyAdminAndPostOwnerOfUpdatedPost(MateItem newmateItem)
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
                    msg.Subject = "Admin there is an updated post to check";
                    msg.Body = $"Admin<br/><br/><a href={newPostLink}>{newPostLink}</a><br /><br /> has been updated. Check and confirm it's content{Utilities.MESSAGEFOOTER}";
                    smtpClient.Send(msg);
                }

                using (MailMessage msg2 = new MailMessage())
                {
                    msg2.From = new MailAddress(Utilities.MAILSERVERUSERNAME, Utilities.DISPLAYNAME);
                    msg2.IsBodyHtml = true;
                    msg2.To.Add(AdOwnerAddress);
                    msg2.Bcc.Add(AdminAddress);
                    msg2.Subject = $"Your updated ad  {newmateItem.Title} has been received and  is under review";
                    msg2.Body = $"Hi {newmateItem.Owner.Firstname},<br/><br/> We are reviewing your updated ad <b>{newmateItem.Title}</b>.<br /><br /> Note that this ad will be suspended until the updated content is approved.{Utilities.MESSAGEFOOTER}";

                    smtpClient.Send(msg2);
                }
            }
        }

        #endregion
    }
}
