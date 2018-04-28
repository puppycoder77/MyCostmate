import { Component, Inject, OnInit, DoCheck, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestOptions, Headers } from "@angular/http";
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from "rxjs/Observable";
import { HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";

@Component({
    selector: 'fetchdata',
    templateUrl: './fetchdata.component.html',
    styleUrls: ['./fetchdata.component.css']
})
export class FetchDataComponent implements OnInit {
    public forecasts: WeatherForecast[];
    currUser: firebase.User | null;

    constructor( @Inject('BASE_URL') private baseUrl: string, private httpclient: HttpClient, private router: Router) {
    }
       
    ngOnInit(): void {
        let userAuthToken = localStorage.getItem('auth_token');
        if (userAuthToken) {
            let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') });
            this.httpclient.get(this.baseUrl + 'api/SampleData/WeatherForecasts', { headers: header }).subscribe(result => {
                this.forecasts = result as WeatherForecast[];
            }, (error: Error) => alert(error.message));
        }
        else {
            this.router.navigate(['/signin']);
        }
    }

}

interface WeatherForecast {
    dateFormatted: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}