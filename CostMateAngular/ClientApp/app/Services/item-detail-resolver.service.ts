import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { MateItemClient } from "../Models/MateItemClient";
import { mateItemWithRelatedObjectsClient } from "../Models/mateItemWithRelatedObjectsClient";
import { AngularFireAuth } from "angularfire2/auth";
import { HttpHeaders } from "@angular/common/http";

@Injectable()
export class ItemDetailResolverService {
    constructor( @Inject('BASE_URL') private baseUrl: string, private httpclient: HttpClient, private router: Router, private afa: AngularFireAuth) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        let paramStatename = route.paramMap.get('statename');
        let paramCatname = route.paramMap.get('catname');
        let paramId = route.paramMap.get('id');

        if (this.afa.auth.currentUser) {
            this.afa.auth.currentUser!.getToken(true).then((token) => {
                localStorage.setItem('auth_token', token);
            });
        }

        let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') });

        var apiLocation = `api/MateItem/state/${paramStatename}/${paramCatname}/${paramId}`

        return this.httpclient.get<mateItemWithRelatedObjectsClient>(this.baseUrl + apiLocation, { headers: header }).map(result => {
            if (result) {
                return result;
            }
            return null

        }).catch(error => {
            return Observable.of(null);
        });
    }
}