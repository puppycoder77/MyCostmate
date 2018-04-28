import { Component, OnInit, Inject } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import { HomePageItemsClient } from "../../Models/HomePageItemsClient";
import { MateItemClient } from "../../Models/MateItemClient";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    homePgItemsCl: HomePageItemsClient | any;

    constructor(public pageTitle: Title, @Inject('BASE_URL') private baseUrl: string, private httpclient: HttpClient, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.pageTitle.setTitle("Welcome to the best cost sharing platform");

        this.route.data.subscribe((data: any) => {
            this.homePgItemsCl = data['homePageDataResv'];

            let hmPgItmCl: HomePageItemsClient = data['homePageDataResv'];
            //THIS MANIPULATION AFFECTED THE LENGTH OF DESCRIPTION, PURE GOLD!!!!
            //For firstItem
            let dummyFirst: MateItemClient = hmPgItmCl.firstItem;
            if (dummyFirst != null) {
                if (dummyFirst.description.length > 220) {
                    dummyFirst.description = dummyFirst.description.substring(0, 220) + "...";
                }

                if (dummyFirst.title.length > 50) {
                    dummyFirst.title = dummyFirst.title.substring(0, 50) + "...";
                }
            }

            //For dummynextTwoItems
            let dummyTwoMiArr: MateItemClient[] = hmPgItmCl.dummynextTwoItems;
            for (var item in dummyTwoMiArr) {
                if (dummyTwoMiArr[item].description.length > 70) {
                    dummyTwoMiArr[item].description = dummyTwoMiArr[item].description.substring(0, 70) + "...";
                }
                if (dummyTwoMiArr[item].title.length > 60) {
                    dummyTwoMiArr[item].title = dummyTwoMiArr[item].title.substring(0, 60) + "...";
                }
            }
        });
    }
}