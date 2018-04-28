import { Component } from '@angular/core';
import * as $ from 'jquery';


@Component({
    selector: 'site-management',
    templateUrl: './site-management.component.html',
    styleUrls: ['./site-management.component.css']
})
export class SiteManagementComponent {
    sidebarShowing: boolean;
    
    constructor() {

    }

    openSideBar() {
        $("#admin-sidebar").animate({
            left: "0",
        }, 300, () => {
            this.sidebarShowing = true;
        })
    }

    closeAdminSideBar() {
        this.HideAdminSidebar();
    }

    HideAdminSidebar() {
        $("#admin-sidebar").animate({
            left: "-70%",
        }, 300, () => {
            this.sidebarShowing = false;
        });
    }
}