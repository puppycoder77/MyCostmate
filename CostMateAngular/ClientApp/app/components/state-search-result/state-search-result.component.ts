import { Component, OnInit, Inject } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from '@angular/common'
import { HttpClient } from "@angular/common/http";
import { MateItemClient } from "../../Models/MateItemClient";

@Component({
    selector: 'search-result',
    templateUrl: './state-search-result.component.html',
    styleUrls: ['./state-search-result.component.css']
})

export class StateSearchResultComponent implements OnInit {
    paramState: string | null;
    paramName: string | null;
    hasCatParam: boolean;
    mateItemClArr: MateItemClient[] | any;

    constructor(private pageTitle: Title, private route: ActivatedRoute, private router: Router, private _location: Location) {}
   
    ngOnInit(): void {
        this.pageTitle.setTitle("State Search result");

        this.route.data.subscribe((data: any) => {
            if (data) {
                this.mateItemClArr = data['stateItemDataResv'];

                let miClArr: MateItemClient[] = data['stateItemDataResv'];
                //THIS MANIPULATION AFFECTED THE LENGTH OF DESCRIPTION, PURE GOLD!!!!
                for (var item in miClArr) {
                    if (miClArr[item].description.length > 130) {
                        miClArr[item].description = miClArr[item].description.substring(0, 130) + "...";
                    }
                }
            }
            else {
                this.mateItemClArr = null;
            }
            //alert(JSON.stringify(data));
        });

        this.route.paramMap.subscribe(paramM => {
            this.paramState = paramM.get('statename');

            if (paramM.get('catname')) {
                this.hasCatParam = true;
                this.paramName = paramM.get('catname');
                //alert(`You gotta catname: ${paramCatname}`);
            }
            else {
                this.hasCatParam = false;
                //alert(`No catname`);
            }
        });
    }

    goBack() {
        this._location.back();
    }
}