import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from 'firebase/app';


@Injectable()
export class DashboardGuardService implements CanActivate {
     canWeMoveForward: boolean = false;
    constructor(private afa: AngularFireAuth) {}

canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):boolean {
    return this.checkLoggedIn();
   }



checkLoggedIn(): boolean {
    var errdetail: any = null;
    if (this.afa.auth.currentUser) {
        
            this.canWeMoveForward = true;
    }
    else {
        this.canWeMoveForward = false;
    }
    return this.canWeMoveForward;
}


//checkLoggedIn(): boolean {
//       var errdetail: any = null;
//       if (this.afa.auth.currentUser) {
//           this.afa.auth.currentUser!.getToken(true).then((token) => {
//               ////LOOKS LIKE THIS SETTING OF LOCALSTORAGE TOKEN IS WHAT IS CAUSING DOUBLE CLOCK BEFORE NAVIGATION TO DASHBOARD(not yet sure)////
//               //localStorage.setItem('auth_token', token);
//              this.canWeMoveForward=true;
//           }).catch((err: firebase.FirebaseError) => {

//               //var errdetail: any = null;
//               if (err.code == "auth/user-not-found") {
//                   errdetail = "No user with such identity"
//               }
//               if (err.message == "A network error (such as timeout, interrupted connection or unreachable host) has occurred.") {
//                   errdetail = "Can't connect to server, check your internet connection and try again."
//                   alert(errdetail);
//               }

//               this.canWeMoveForward = false;
//           })
//       }
//       return this.canWeMoveForward;
//}

}