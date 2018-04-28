import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "../../Services/api.service";
import { MateItemClient } from "../../Models/MateItemClient";
import { Title } from "@angular/platform-browser";

@Component({
    selector: 'user-post-list',
    templateUrl: './user-post-list.component.html',
    styleUrls: ['./user-post-list.component.css']
})
export class UserPostListComponent implements OnInit {
    deletedMsg: any;
    postedItems: MateItemClient[];

    constructor(private route: ActivatedRoute, private apiservice: ApiService, private pageTitle: Title, private router: Router) {}

    ngOnInit(): void {
        this.pageTitle.setTitle("Published Items");
        this.route.data.subscribe((data: any) => {
            this.postedItems = data['postListDataResv'];
            //Manipulation description length
            let MiArr: MateItemClient[] = this.postedItems;
            for (var item in MiArr) {
                if (MiArr[item].description.length > 150) {
                    MiArr[item].description = MiArr[item].description.substring(0, 150) + "...";
                }
            }
        });

        ///////////////Redraw posted list///////////////////////
        if (this.apiservice.deletedPostItemId != null) {
            var thisPostedItems = this.postedItems;
            for (var i = 0; i < thisPostedItems.length; i++) {
                if (thisPostedItems[i].id == this.apiservice.deletedPostItemId) {
                    this.deletedMsg = `Successfully removed ${thisPostedItems[i].title}`;
                    thisPostedItems.splice(thisPostedItems.indexOf(thisPostedItems[i]), 1);
                }
            }
        }
        this.postedItems = this.postedItems;
        /////////////End of redrawing posted list.////////////////
    }

    alertClosed() {
        this.deletedMsg = null;
    }
}