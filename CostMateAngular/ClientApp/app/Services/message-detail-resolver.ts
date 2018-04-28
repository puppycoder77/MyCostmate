import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, Resolve } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { UserMessageClient } from "../Models/userMessageClient";
import { AngularFireAuth } from "angularfire2/auth";
import { HttpHeaders } from "@angular/common/http";
import * as firebase from 'firebase/app';


@Injectable()
export class MessageDetailResolverService implements Resolve<UserMessageClient> {
    constructor( @Inject('BASE_URL') private baseUrl: string, private httpclient: HttpClient, private router: Router, private afa: AngularFireAuth) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        let id = route.params['id'];
        if (isNaN(id)) {
            alert(`Message id was not a number: ${id}`);
            this.router.navigate(['/dashboard/message/received'])
            return Observable.of(null);
        }

        if (this.afa.auth.currentUser) {
            this.afa.auth.currentUser!.getToken(true).then((token) => {
                localStorage.setItem('auth_token', token);
            }).catch((err: firebase.FirebaseError) => {

                if (err.code == "auth/user-not-found") {
                    alert("No user with such identity");
                }
                if (err.message == "A network error (such as timeout, interrupted connection or unreachable host) has occurred.") {
                    alert("Can't connect to server, check your internet connection and try again.");
                }
            });
        }

        let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') });
        var apiLocation = `api/AppUserManager/user/getSpecificMsg/${+id}`

        return this.httpclient.get<UserMessageClient>(this.baseUrl + apiLocation, { headers: header }).map(result => {
            if (result) {
                return result;
            }
            return null

        }).catch(error => {
            return Observable.of(null);
        });
    }
}