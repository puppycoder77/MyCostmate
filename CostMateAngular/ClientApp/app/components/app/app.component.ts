import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { Utility } from "../../Models/Utility";
//import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from 'firebase/app';
import * as $ from 'jquery';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    loggedIn: boolean;
    loading: boolean = true;
    currentYear: number;
    
    constructor(private router: Router, private httpclient: HttpClient, private afa: AngularFireAuth) {
        
    }

    ngOnInit(): void {

        this.currentYear = new Date().getFullYear();

        this.router.events.subscribe((routerEvent: Event) => {
            this.checkRouterEvent(routerEvent);
        });

        //Control footer login and logout text
        this.afa.auth.onAuthStateChanged((user: firebase.User) => {
            if (user) {
                this.loggedIn = true;

            } else {
                this.loggedIn = false;
            }
        });
        /////////////////////////////////////

        $(window).scroll(function () {
            if ($(this).scrollTop() > $("#emptyJustForMarkingPosition").offset().top) {
                $("#moveUpArrow").fadeIn("slow");
            }
            else {
                $("#moveUpArrow").fadeOut("slow");
            }
        });
    }

    checkRouterEvent(routerEvent: Event): void {
        if (routerEvent instanceof NavigationStart) {
            this.loading = true;
        }

        if (routerEvent instanceof NavigationEnd || routerEvent instanceof NavigationCancel || routerEvent instanceof NavigationError) {
            this.loading = false;
        }

        window.scrollTo(0, 0)
    }

    logOut(evt: any) {
        evt.preventDefault();
        this.afa.auth.signOut();
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiration');
        //this.router.navigate(['']);
    }

    moveTop(evt:any) {
        evt.preventDefault();
        $("html").animate({ scrollTop: 0 }, "slow");
    }
}
