import { Component, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";


@Component({
    selector: 'contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
    contactFormGroup: FormGroup;
   
    constructor(public pageTitle: Title, private fb: FormBuilder) { }

    ngOnInit(): void {
        this.pageTitle.setTitle("Contact us");

        this.contactFormGroup = this.fb.group({
            senderName: ['', Validators.required],
            senderEmail: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
            message: ['', Validators.required]
        });
    }

    
    contactAndNotify(value: any) {
        let senderNameVal = value.senderName;
        let senderEmailVal = value.senderEmail;
        let messageVal = value.message;

        ///////TRIMMED VALUES////////////
        let senderNameValTrimmedLength = (<string>senderNameVal).trim().length;
        let senderEmailValTrimmedLength = (<string>senderEmailVal).trim().length;
        let messageValTrimmedLength = (<string>messageVal).trim().length;

        /////////////////////////////////TODO:Apply this same logic to other orm submissions.//////////////////////////////////////
        if (senderNameValTrimmedLength < 1 || senderEmailValTrimmedLength < 1 || messageValTrimmedLength < 1) {
            alert(`you are trying to submit an empty Value`);
            this.contactFormGroup.reset();
            //this.contactFormGroup.get('senderName')!.reset();
        }
        else {
            //alert(`you submitted  senderName: ${senderNameVal} | senderEmail: ${senderEmailVal} | message: ${messageVal}`)
            alert(`Message sent successfully, ${senderNameVal} we'll get back to you soon!`);
            this.contactFormGroup.reset();
        }
    }

}