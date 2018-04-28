import { Injectable, Inject } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { MateItemClient } from "../Models/MateItemClient";

@Injectable()
export class StateSearchResultResolverService {
    constructor( @Inject('BASE_URL') private baseUrl: string, private httpclient: HttpClient, private router: Router, private _location:Location) { }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        let paramCatname = route.paramMap.get('catname');
        let paramStatename = route.paramMap.get('statename');

        if (paramCatname) {
            return this.httpclient.get<any>(this.baseUrl + `api/MateItem/state/${paramStatename}/${paramCatname}`).map(result => {
                if (result) {
                    return result;
                }
                return null

            }).catch(error => {
                return Observable.of(null);
            });
        }
        if (!paramCatname) {
            return this.httpclient.get<MateItemClient[]>(this.baseUrl + `api/MateItem/state/${paramStatename}`).map(result => {
                if (result) {
                    return result;
                }
                return null

            }).catch(error => {
                //this.router.navigate([' ']);
                ////this._location.back();
                //this.router.navigateByUrl('nomatch', { skipLocationChange: true });
                return Observable.of(null);
            });
        }
        //this.router.navigate(['']);
        return Observable.of(null);

    }
}