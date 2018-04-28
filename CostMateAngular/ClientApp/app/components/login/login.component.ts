import { Component, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
//import { } from '@angular/common/http';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Observable } from "rxjs/Observable";
import { UserDetailsFromFirebaseService } from "../../Services/user-details-from-firebase.service";
import { ApiService } from "../../Services/api.service";

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
/** Login component*/
export class LoginComponent implements OnInit  {
    alreadyLogeddIn: boolean;
    showEmailVerificationMsg: boolean;

    emailVerified: boolean;
    submittedEmptyValue: boolean;
    loginSuccess: boolean;
    contactingServer: boolean;
    emailOrPswdInvalid: string;
    //currentUser: firebase.User;
    authState: Observable<firebase.User | null>;
    loginFormGroup: FormGroup;

    constructor(public pageTitle: Title, private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private afa: AngularFireAuth, private apiservice: ApiService, private usdffb: UserDetailsFromFirebaseService) { }

    ngOnInit(): void {
        this.pageTitle.setTitle("Sign in");
        this.loginFormGroup = this.fb.group({
            //username: ['', [Validators.required, Validators.minLength(5)]],
            email: ['', [Validators.required, , Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
            password: ['', [Validators.required, Validators.minLength(7)]]
        });

        /////Don't allow a logged in user to see login form///////
        this.afa.auth.onAuthStateChanged((user: firebase.User) => {
            if (user) {
                this.alreadyLogeddIn = true;

            } else {
                this.alreadyLogeddIn = false;
            }
        });
        /////////////////////////////////////////////////////////
    }

    loginAndNavigate(value: any) {
        this.submittedEmptyValue = false;
        this.emailOrPswdInvalid = "";
        //let usernameVal = value.username;
        let emailVal = value.email
        let passwordVal = value.password;

        //let usernameValTrimmedLength = (<string>usernameVal).trim().length;
        let passwordValTrimmedLength = (<string>passwordVal).trim().length;
        let emailValTrimmedLength = (<string>emailVal).trim().length;

        if (emailValTrimmedLength < 1 || passwordValTrimmedLength < 1) {
            this.submittedEmptyValue = true;
            this.loginFormGroup.reset();
        }
        else {
            //alert(`you submitted  Username: ${usernameVal} Password: ${passwordVal} `);

           //display spinner or something here
            this.contactingServer = true;

            /*************************************Login only if email has been verified***************************************/
                this.afa.auth.signInWithEmailAndPassword(emailVal, passwordVal)
                    .then((success: any) => {
                        if (this.afa.auth.currentUser.emailVerified) {
                            //Hide spinner or something here
                            this.contactingServer = false;
                            this.loginSuccess = true;

                            //var currentTokenExpiration = JSON.parse(localStorage.getItem("firebase:authUser:AIzaSyCqUUN8YbFiOFemLoFHcHx7-EPDUCvEpeg:[DEFAULT]")!).stsTokenManager.expirationTime;

                            this.loginFormGroup.reset();

                            this.afa.auth.currentUser!.getToken(true).then((token) => {
                                localStorage.setItem('auth_token', token);
                                //localStorage.setItem('token_expiration', currentTokenExpiration);

                                if (this.apiservice.prevUrl) {
                                    this.router.navigate([this.apiservice.prevUrl]);
                                    this.apiservice.prevUrl = null; //clear it to avoid normal login going to the saved url.
                                }
                                else {
                                    this.router.navigate(['home']);
                                    //this.router.navigateByUrl('/dashboard/profile');
                                }
                            })

                            this.showEmailVerificationMsg = false;
                            this.emailVerified = true;
                        }
                        else {
                            this.afa.auth.signOut();
                            this.showEmailVerificationMsg = true;
                            this.emailVerified = false;
                            this.contactingServer = false;
                        }

                    }, (err: firebase.FirebaseError) => {

                        var errdetail: any = null;
                        if (err.code == "auth/user-not-found") {
                            errdetail = "No user with such identity"
                        }
                        if (err.message == "A network error (such as timeout, interrupted connection or unreachable host) has occurred.") {
                            errdetail = "Can't connect to server, check your internet connection and press the sign in button again."
                        }
                        else {
                            errdetail = err.message;
                        }
                        this.emailOrPswdInvalid = errdetail;
                    });
             /*************************************End of Login only if email has been verified***************************************/
            //TODO:comment out username from form definition and create email instead since firebase needs email to sign in.
        }
    }


    forgottenPassword() {
        this.router.navigate(['forgotpswd']);
    }


    logOut(evt: Event) {
        evt.preventDefault();
        this.afa.auth.signOut();
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiration');
        //this.router.navigate(['']);
    }

    loginWithFacebook(evt:Event) {
        evt.preventDefault();
        //alert("Facebook login coming soon!");
        this.afa.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
    }

    loginWithTwitter(evt: Event) {
        evt.preventDefault();
        //alert("Twitter login coming soon!");
        this.afa.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());
    }

    loginWithGoogle(evt:Event) {
        evt.preventDefault();
        //alert("Google login coming soon!");
        this.afa.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }
}