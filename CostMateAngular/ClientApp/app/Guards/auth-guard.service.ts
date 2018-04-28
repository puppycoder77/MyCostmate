import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate() {
        //you can check token is exists or not here
        if (localStorage.getItem('auth_token')) {
           

            return true;
        } else {
            this.router.navigate(['/signin']);
            return false;
        }
    }
}