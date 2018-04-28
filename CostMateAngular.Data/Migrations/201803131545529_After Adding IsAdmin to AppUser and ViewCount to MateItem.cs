namespace CostMateAngular.Data.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AfterAddingIsAdmintoAppUserandViewCounttoMateItem : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AppUsers", "IsAdmin", c => c.Boolean(nullable: false));
            AddColumn("dbo.MateItems", "ViewCount", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.MateItems", "ViewCount");
            DropColumn("dbo.AppUsers", "IsAdmin");
        }
    }
}
