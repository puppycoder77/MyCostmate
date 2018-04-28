import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, Resolve } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { HomePageItemsClient } from "../Models/HomePageItemsClient";

@Injectable()
export class HomePageResolverService implements Resolve<HomePageItemsClient>{
    constructor( @Inject('BASE_URL') private baseUrl: string, private httpclient: HttpClient, private router: Router) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this.httpclient.get<HomePageItemsClient>(this.baseUrl + 'api/MateItem').map(result => {
            if (result) {
                //alert(JSON.stringify(result));
                    return result;
                }
                return null

            }).catch(error => {
                return Observable.of(null);
            });
        }
}