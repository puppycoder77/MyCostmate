import { Component, Inject } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import { Router, Route, ActivatedRoute } from "@angular/router";
import { FormBuilder, Validators, FormGroup, AbstractControl } from "@angular/forms";
import * as firebase from 'firebase/app';
import * as $ from 'jquery';

import { AngularFireAuth } from "angularfire2/auth";
import { Observable } from "rxjs/Observable";


function passwordMatcher(c: AbstractControl): { [key: string]: boolean } | null {
    let passwordControl = c.get('password');
    let confirmPasswordControl = c.get('confirmPassword');
    if (passwordControl!.pristine || confirmPasswordControl!.pristine) {
        return null;
    }
    if (passwordControl!.value === confirmPasswordControl!.value) {
        return null;
    }
    return { 'match': true };
}



@Component({
    selector: 'emhndl',
    templateUrl: './emhndl.component.html',
    styleUrls: ['./emhndl.component.css']
})
export class EmhndlComponent {
    stillContactingFirebase: boolean;
    hideForm: boolean;
    hasResetSuccessfully: boolean;
    showPasswordTxtBox: boolean;
    newPswdFormGroup: FormGroup;
    hasUsedLink: boolean;
    hasVerifiedEmail: boolean;
    paramOobCode: string;
    paramMode: string;
    newPassword: string; //Will be using this for password reset.
    isQueryParamsComplete: boolean;

    constructor(public pageTitle: Title, @Inject('BASE_URL') private baseUrl: string, private httpclient: HttpClient, private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private afa: AngularFireAuth) {
    }

    ngOnInit(): void {
        this.pageTitle.setTitle("Confirmation");

        this.route.queryParamMap.subscribe(paramM => {
            if (!paramM.get('mode') || !paramM.get('oobCode')) {
                this.isQueryParamsComplete = false;
                //alert(`You are not yet ready for confirmation`);
            }
            else {
                var auth = this.afa.auth;
                this.paramMode = paramM.get('mode');
                this.paramOobCode = paramM.get('oobCode');
                this.isQueryParamsComplete = true;

                /***************Handle the user management action***************/
                // Handle the user management action.
                switch (this.paramMode) {
                    case 'resetPassword':
                        this.showPasswordTxtBox = true;
                        // Display reset password handler and UI.
                        this.newPswdFormGroup = this.fb.group({
                            passwordGroup: this.fb.group({
                                password: ['', [Validators.required, Validators.minLength(6)]],
                                confirmPassword: ['', Validators.required],
                            }, { validator: passwordMatcher })
                            //password: ['', [Validators.required, Validators.minLength(7)]]
                        });

                        this.handleResetPassword(auth, this.paramOobCode);
                        break;
                    case 'recoverEmail':
                        // Display email recovery handler and UI.
                        this.handleRecoverEmail(auth, this.paramOobCode);
                        break;
                    case 'verifyEmail':
                        // Display email verification handler and UI.
                        this.handleVerifyEmail(auth, this.paramOobCode);
                        break;
                    default:
                    // Error: invalid mode.
                }
                /***************End of Handle the user management action***************/
            }
        });


    }

    handleVerifyEmail(auth: firebase.auth.Auth, actionCode: any) {
        let emhndlCompClass = this;
        // Try to apply the email verification code.
        auth.applyActionCode(actionCode).then(function (resp: any) {
            // Email address has been verified.
            emhndlCompClass.hasVerifiedEmail = true;
            $("html").animate({ scrollTop: 0 }, "slow");
            // TODO: Display a confirmation message to the user.
            // You could also provide the user with a link back to the app.
            

            // TODO: If a continue URL is available, display a button which on
            // click redirects the user back to the app via continueUrl with
            // additional state determined from that URL's parameters.
        }).catch(function (error: Error) {
            // Code is invalid or expired. Ask the user to verify their email address
            // again.
            if (error.message.indexOf("expired") != -1 && !auth.currentUser.emailVerified) {
                    //alert("Link code has expired");
                    emhndlCompClass.hasUsedLink = true;
            }

            //Force the user back to homepage he does not need this confirmation page.
                if (error.message.indexOf("expired") != -1 && auth.currentUser.emailVerified) {
                    emhndlCompClass.router.navigate([''])
                }

            });
    }

    handleResetPassword(auth: firebase.auth.Auth, actionCode: any) {
        let that = this;
        var accountEmail;
        var newPasswordToUse = this.newPswdFormGroup.get("passwordGroup.password").value
        // Verify the password reset code is valid.
        auth.verifyPasswordResetCode(actionCode).then(function (email) {
            var accountEmail = email;

            // TODO: Show the reset screen with the user's email and ask the user for
            // the new password.

            // Save the new password.
            auth.confirmPasswordReset(actionCode, newPasswordToUse).then(function (resp) {
                // Password reset has been confirmed and new password updated.
                that.hasResetSuccessfully = true;
                // TODO: Display a link back to the app, or sign-in the user directly
                // if the page belongs to the same domain as the app:
                // auth.signInWithEmailAndPassword(accountEmail, newPassword);

                // TODO: If a continue URL is available, display a button which on
                // click redirects the user back to the app via continueUrl with
                // additional state determined from that URL's parameters.
            }).catch(function (error) {
                // Error occurred during confirmation. The code might have expired or the
                // password is too weak.
            });
        }).catch(function (error) {
            // Invalid or expired action code. Ask user to try to reset the password
            // again.
        });
    }

    ClickAndConfirmPswdReset(value?: any) {
        let that = this;
        // Save the new password.

        this.stillContactingFirebase = true;

        this.afa.auth.confirmPasswordReset(this.paramOobCode, value.passwordGroup.password).then(function (resp) {
            that.stillContactingFirebase = false;
            // Password reset has been confirmed and new password updated.
            that.hasResetSuccessfully = true;

            if (that.afa.auth.currentUser) {
                that.afa.auth.signOut(); //
            }

            $("html").animate({ scrollTop: 0 }, "slow");
            that.hideForm = true;
            // TODO: Display a link back to the app, or sign-in the user directly
            // if the page belongs to the same domain as the app:
            // auth.signInWithEmailAndPassword(accountEmail, newPassword);

            // TODO: If a continue URL is available, display a button which on
            // click redirects the user back to the app via continueUrl with
            // additional state determined from that URL's parameters.
        }).catch(function (error) {
            // Error occurred during confirmation. The code might have expired or the password is too weak
            $("html").animate({ scrollTop: 0 }, "slow");
            alert("Oops an error has occured!!");
        });
    }

    handleRecoverEmail(auth: firebase.auth.Auth, actionCode: any) {
        var restoredEmail: any = null;
        // Confirm the action code is valid.
        auth.checkActionCode(actionCode).then(function (info) {
            // Get the restored email address.
            restoredEmail = info['data']['email'];

            // Revert to the old email.
            return auth.applyActionCode(actionCode);
        }).then(function () {
            // Account email reverted to restoredEmail

            // TODO: Display a confirmation message to the user.

            // You might also want to give the user the option to reset their password
            // in case the account was compromised:
            auth.sendPasswordResetEmail(restoredEmail).then(function () {
                // Password reset confirmation sent. Ask user to check their email.
            }).catch(function (error) {
                // Error encountered while sending password reset code.
            });
        }).catch(function (error) {
            // Invalid code.
        });
    }

}