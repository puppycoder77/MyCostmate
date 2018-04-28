namespace CostMateAngular.Data.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AfteraddingApprovedandShowOnHomePagetoMateItem : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.MateItems", "Approved", c => c.Boolean(nullable: false));
            AddColumn("dbo.MateItems", "ShowOnHomePage", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.MateItems", "ShowOnHomePage");
            DropColumn("dbo.MateItems", "Approved");
        }
    }
}
