import { Component, OnInit  } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';

import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from 'firebase/app';


@Component({
    selector: 'forgotpswd',
    templateUrl: './forgotpswd.component.html',
    styleUrls: ['./forgotpswd.component.css']
})
/** forgotpswd component*/
export class ForgotpswdComponent {
    userEmail: any;
    sentMsg: any;
    showSentMsg: boolean;
    showErrorMsg: boolean;
    hideForm: boolean;
    submittedEmptyValue: boolean;
    pswdResetFormGroup: FormGroup;
    
    constructor(public pageTitle: Title, private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private afa: AngularFireAuth) {

    }

    ngOnInit(): void {
        this.pageTitle.setTitle("Forgot password");

        this.pswdResetFormGroup = this.fb.group({
            email: ['', [Validators.required, , Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
            //password: ['', [Validators.required, Validators.minLength(7)]]
        });
    }

    sendPswdResetEmail(value: any) {
        let emailVal = value.email;
        let emailValTrimmedLength = (<string>emailVal).trim().length;
        let that = this;

        if (emailValTrimmedLength < 1) {
            this.submittedEmptyValue = true;
            this.pswdResetFormGroup.reset();
        }
        else {
            this.afa.auth.sendPasswordResetEmail(emailVal).then((cnf) => {
                this.userEmail = emailVal;

                $("html").animate({ scrollTop: 0 }, "slow");
                that.showSentMsg = true;
                that.hideForm = true;
            }).catch(function () {
                $("html").animate({ scrollTop: 0 }, "slow");
                that.showErrorMsg = true;
            })

        }
    }

}