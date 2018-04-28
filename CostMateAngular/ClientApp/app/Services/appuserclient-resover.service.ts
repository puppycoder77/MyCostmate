import { Injectable, Inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { AppUserClient } from "../Models/AppUserClient";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { ApiService } from "./api.service";
/*import { HttpHeaders, HttpRequest } from "@angular/common/http";*/
import { HttpClient, HttpHeaders} from "@angular/common/http";

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';


@Injectable()
export class AppuserclientResolver implements Resolve<AppUserClient> {
    appUserclFrSrvc: AppUserClient;
    constructor( @Inject('BASE_URL') private baseUrl: string, private apiService: ApiService, private router: Router, private httpclient: HttpClient,  private afa: AngularFireAuth) { }
    //TODO:Rewrite this logic is too verbose, look at other resolver and use them to correct this.
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this.getUser().map((appusercl) => {
            if (appusercl) {
                return appusercl;
            }
            this.router.navigate(['']);
            return null;
        })
            .catch((error: Error) => {
                this.router.navigate(['']);
                return Observable.of(null);
            });
    }

    getUser(): Observable<AppUserClient> {
        if (this.afa.auth.currentUser) {
            this.afa.auth.currentUser!.getToken(true).then((token) => {
                localStorage.setItem('auth_token', token);
            }).catch((err: firebase.FirebaseError) => {

                if (err.code == "auth/user-not-found") {
                    //errdetail = "No user with such identity"
                    alert("No user with such identity");
                }
                if (err.message == "A network error (such as timeout, interrupted connection or unreachable host) has occurred.") {
                    //errdetail = "Can't connect to server, check your internet connection and try again."
                    alert("Can't connect to server, check your internet connection and try again.");
                }
            });
        }

        let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') });
       
        return this.httpclient.get(this.baseUrl + 'api/AppUserManager/user', { headers: header }).map(result => {
            if (result) {
                return result;
            }
            return null
        }).catch(error => {
            return Observable.of(null);
        });
    }
}