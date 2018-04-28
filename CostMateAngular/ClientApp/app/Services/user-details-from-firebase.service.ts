import { Injectable, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';


@Injectable()
export class UserDetailsFromFirebaseService {
   
    fireBUser: firebase.User | null;
    intentedUrl: string;

    public userToken: string;
    public userEmailFromService: string;

    constructor(private afa: AngularFireAuth) {
       
    }
}