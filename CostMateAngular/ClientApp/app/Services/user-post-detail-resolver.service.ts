import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, Resolve } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { AngularFireAuth } from "angularfire2/auth";
import { HttpHeaders } from "@angular/common/http";
import { MateItemClient } from "../Models/MateItemClient";
import * as firebase from 'firebase/app';


@Injectable()
export class UserPostDetailResolverService implements Resolve<MateItemClient[]> {
    constructor( @Inject('BASE_URL') private baseUrl: string, private httpclient: HttpClient, private router: Router, private afa: AngularFireAuth) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        let paramId = route.paramMap.get('id');

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
        var apiLocation = `api/AppUserManager/user/getSpecificUserPosts/${paramId}`

        return this.httpclient.get<MateItemClient[]>(this.baseUrl + apiLocation, { headers: header }).map(result => {
            if (result) {
                return result;
            }
            return null

        }).catch(error => {
            return Observable.of(null);
        });
    }
}