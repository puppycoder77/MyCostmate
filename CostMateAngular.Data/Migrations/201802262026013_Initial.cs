namespace CostMateAngular.Data.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.AppUsers",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Firstname = c.String(),
                        Lastname = c.String(),
                        Email = c.String(),
                        Phone = c.String(),
                        PhotoUrl = c.String(),
                        State = c.String(),
                        DateRegistered = c.DateTime(),
                        UniqueId = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.MateItems",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Title = c.String(),
                        Description = c.String(),
                        AppUserId = c.Int(nullable: false),
                        ItemState = c.String(),
                        ItemCategory = c.String(),
                        DatePosted = c.DateTime(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.AppUsers", t => t.AppUserId, cascadeDelete: true)
                .Index(t => t.AppUserId);
            
            CreateTable(
                "dbo.Photos",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Filename = c.String(),
                        MateItem_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.MateItems", t => t.MateItem_Id)
                .Index(t => t.MateItem_Id);
            
            CreateTable(
                "dbo.UserMessages",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Body = c.String(),
                        SenderId = c.Int(nullable: false),
                        DateSent = c.DateTime(),
                        HasBeenRead = c.Boolean(nullable: false),
                        TitleExtractedFromItemTitle = c.String(),
                        ForMateItem_Id = c.Int(),
                        Receiver_Id = c.Int(),
                        AppUser_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.MateItems", t => t.ForMateItem_Id)
                .ForeignKey("dbo.AppUsers", t => t.Receiver_Id)
                .ForeignKey("dbo.AppUsers", t => t.SenderId, cascadeDelete: true)
                .ForeignKey("dbo.AppUsers", t => t.AppUser_Id)
                .Index(t => t.SenderId)
                .Index(t => t.ForMateItem_Id)
                .Index(t => t.Receiver_Id)
                .Index(t => t.AppUser_Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.UserMessages", "AppUser_Id", "dbo.AppUsers");
            DropForeignKey("dbo.UserMessages", "SenderId", "dbo.AppUsers");
            DropForeignKey("dbo.UserMessages", "Receiver_Id", "dbo.AppUsers");
            DropForeignKey("dbo.UserMessages", "ForMateItem_Id", "dbo.MateItems");
            DropForeignKey("dbo.MateItems", "AppUserId", "dbo.AppUsers");
            DropForeignKey("dbo.Photos", "MateItem_Id", "dbo.MateItems");
            DropIndex("dbo.UserMessages", new[] { "AppUser_Id" });
            DropIndex("dbo.UserMessages", new[] { "Receiver_Id" });
            DropIndex("dbo.UserMessages", new[] { "ForMateItem_Id" });
            DropIndex("dbo.UserMessages", new[] { "SenderId" });
            DropIndex("dbo.Photos", new[] { "MateItem_Id" });
            DropIndex("dbo.MateItems", new[] { "AppUserId" });
            DropTable("dbo.UserMessages");
            DropTable("dbo.Photos");
            DropTable("dbo.MateItems");
            DropTable("dbo.AppUsers");
        }
    }
}
