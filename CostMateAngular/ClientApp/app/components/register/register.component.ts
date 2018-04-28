import { Component, OnInit, Inject } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { Utility } from "../../Models/Utility";
import { FormBuilder, Validators, FormGroup, AbstractControl } from "@angular/forms";
import 'rxjs/add/operator/debounceTime';
import { Router } from "@angular/router";
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import * as $ from 'jquery';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from "@angular/common/http";


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
    selector: 'register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
    regErrorOccured: boolean;
    currUserEmail: any;
    confirmationMsgSent: boolean;
    registerSuccessNowLoginIn: boolean;
    registeringNewUser: boolean;
    regErrmsg: string;
    showAlert: boolean;
    registerFormGroup: FormGroup;
    emailMessage: string;
    allNigState: Array<string>;
    private validationMessages = {
        required: 'Please enter your email address.',
        pattern: 'Please enter a valid email address.'
    };

    constructor(public pageTitle: Title, @Inject('BASE_URL') private baseUrl: string, private httpclient: HttpClient, private fb: FormBuilder, private router: Router, private afa: AngularFireAuth) {
        this.allNigState = Utility.ngStates();
    }

    ngOnInit(): void {
        this.pageTitle.setTitle("Signup");

        this.registerFormGroup = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(5)]],
            firstname: ['', [Validators.required, Validators.maxLength(20)]],
            lastname: ['', [Validators.required, Validators.maxLength(20)]],
            passwordGroup: this.fb.group({
                password: ['', [Validators.required, Validators.minLength(6)]],
                confirmPassword: ['', Validators.required],
            }, { validator: passwordMatcher }),
            email: ['', [Validators.required, , Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
            phone: ['', [Validators.required, Validators.maxLength(15)]],
            userState: ['', Validators.required]
        });

        //const passwordControl = this.registerFormGroup.get('passwordGroup.password');
        //passwordControl!.valueChanges.debounceTime(1000).subscribe(value =>
        //    this.setMessage(passwordControl!));
    }

    //setMessage(c: AbstractControl): void {
    //    this.emailMessage = '';
    //    if ((c.touched || c.dirty) && c.errors) {
    //        this.emailMessage = Object.keys(c.errors).map(key =>
    //            this.validationMessages[key]).join(' ');
    //    }
    //}

    registerAndNavigate(value: any) {
        let usernameVal = value.username;
        let firstnameVal = value.firstname;
        let lastnameVal = value.lastname;
        let passwordVal = value.passwordGroup.password;
        let retypePasswordVal = value.passwordGroup.confirmPassword;
        let emailVal = value.email;
        let userStateVal = value.userState;

        let usernameValTrimmedLength = (<string>usernameVal).trim().length;
        let firstnameValTrimmedLength = (<string>usernameVal).trim().length;
        let lastnameValTrimmedLength = (<string>usernameVal).trim().length;
        let passwordValTrimmedLength = (<string>passwordVal).trim().length;
        let emailValTrimmedLength = (<string>emailVal).trim().length;
        let userStateValTrimmedLength = (<string>userStateVal).trim().length;

        if (usernameValTrimmedLength < 1 || firstnameValTrimmedLength < 1 || lastnameValTrimmedLength < 1 || passwordValTrimmedLength < 1 || emailValTrimmedLength < 1) {
            alert(`you are trying to submit an empty Value`);
            this.registerFormGroup.get('username')!.reset();
            this.registerFormGroup.get('firstname')!.reset();
            this.registerFormGroup.get('lastname')!.reset();
            this.registerFormGroup.get('passwordGroup.password')!.reset();
            this.registerFormGroup.get('passwordGroup.confirmPassword')!.reset();
            this.registerFormGroup.get('passwordGroup.confirmPassword')!.reset();
            this.registerFormGroup.get('email')!.reset();
        }
        else {
            this.registeringNewUser = true;
            this.afa.auth.createUserWithEmailAndPassword(emailVal, passwordVal)
                .then((vl) => {
                    this.registeringNewUser = false;
                    var currUser = firebase.auth().currentUser;

                    //Populate WebapiAppUser(Puppy Style)
                    var userData = {
                        "Firstname": this.registerFormGroup.get('firstname')!.value,
                        "Lastname": this.registerFormGroup.get('lastname')!.value,
                        "Email": emailVal,
                        "Phone": this.registerFormGroup.get('phone')!.value,
                        "State": this.registerFormGroup.get('userState')!.value,
                    }

                    this.afa.auth.currentUser!.getToken(true).then((token) => {
                        localStorage.setItem('auth_token', token);
                        let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token'), 'Content-Type': 'application/json' });
                        this.httpclient.post(this.baseUrl + 'api/AppUserManager', JSON.stringify(userData), { headers: header }).subscribe(result => {
                        }, (error: Error) => console.log(error.message));
                    });
                    //End of Populate WebapiAppUser

                    (<firebase.User>currUser).updateProfile({
                        displayName: usernameVal,
                        photoURL: ""
                    });

                    //this.afa.auth.signInWithEmailAndPassword(emailVal, passwordVal).then((success) => {
                    //}).then((scss) => {

                    //    //Registrationn and loginin successful
                    //    this.registerSuccessNowLoginIn = true;

                    //    //Navigating to profile page instead of homepage, this might solve the problem of numerous clicking b/4 activating dashboard.
                    //    //Navigate to profile Page
                    //    this.router.navigate(['/dashboard/profile']);
                    //    //---------------------------------------------------------------------------------------------------------

                    //    this.registerFormGroup.reset();

                    //}).catch((signupErr: Error) => { alert(`Sign up Error: ${signupErr.message}`); })
                    

                    /*********************TRY SENDING EMAIL VERIFICATION.***************************/
                    if (!this.afa.auth.currentUser.emailVerified) {
                        this.afa.auth.currentUser.sendEmailVerification().then((resolved) => {
                           
                            this.afa.auth.signOut(); //Need to logout here since user is logged in automatically after registering.
                            this.currUserEmail = emailVal;
                            this.confirmationMsgSent = true;
                            $("html").animate({ scrollTop: 0 }, "slow");

                        }, (rejectedErr) => {
                            alert(rejectedErr.message);
                        });
                    }
                    /*********************END OF TRY SENDING EMAIL VERIFICATION************************************/

                })
                .catch((createUserErr) => {
                    //console.log(createUserErr.message)
                    this.showAlert = true;
                    this.regErrmsg = createUserErr.message;
                    this.regErrorOccured = true;
                    //alert(createUserErr.message);
                })
        }


       // /*********************TRY SENDING EMAIL VERIFICATION:  //TODO Later.***************************/
       // this.afa.auth.onAuthStateChanged((user: firebase.User) => {
       //     if (!user.emailVerified) {
       //         this.afa.auth.currentUser.sendEmailVerification().then((resolved) => {
       //             /////alert the user that email verification has been sent.
       //             alert(`An confirmation mail has been sent to ${emailVal}`);

       //         }, (rejectedErr) => {
       //             alert(rejectedErr.message);
       //         });
       //     }
       // })
       ///*********************END OF TRY SENDING EMAIL VERIFICATION************************************/
        
    }
}