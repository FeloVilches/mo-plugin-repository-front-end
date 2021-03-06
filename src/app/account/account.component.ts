import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Angular2TokenService } from "angular2-token";
import { Title } from '@angular/platform-browser';
import { NotificationsService } from 'angular4-notifications';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  myPlugins = null;

  user = null;

  changingPassword: boolean = false;
  changingUsername: boolean = false;
  changingUsernameLoading: boolean = false;
  usernameInput: string;

  passChange = {
    new1: "",
    new2: "",
    old: ""
  };

  constructor(private userService: UserService, public tokenAuthService: Angular2TokenService, private titleService: Title, private notification: NotificationsService) { }

  changeUsername(){

    if(this.usernameInput === this.user.nickname){
      this.changingUsername = false;
      return;
    }

    this.changingUsernameLoading = true;

    this.userService.updateUsername(this.usernameInput).subscribe(
      data => {
        let newUser = data.json();
        this.user = newUser;
        this.notification.success("Username updated correctly", "Your new username is " + this.user.nickname);
      },
      err => {

        this.changingUsernameLoading = false;

        let defaultError: string = "There was an error."
        let error: string;

        try {
          error = err.json()['nickname'][0];
        } catch(e){
          error = defaultError;
        }

        this.notification.error("Error", error);

      },
      () => {
        this.changingUsernameLoading = false;
        this.changingUsername = false;
      }
    );
  }


  changePassword(){

    if(this.passChange.new1 != this.passChange.new2){
      this.notification.error("Error", "Passwords don't match");
      return;
    }

    if(this.passChange.new1.length == 0){
      this.notification.error("Error", "New password can't be blank");
      return;
    }

    this.changingPassword = true;

    this.tokenAuthService.updatePassword({
      password:             this.passChange.new1,
      passwordConfirmation: this.passChange.new2,
      passwordCurrent:      this.passChange.old,
      resetPasswordToken:   'resetPasswordToken',
    }).subscribe(
      res => {
        this.changingPassword = false;
        console.log(res)
        this.passChange.new1 = "";
        this.passChange.new2 = "";
        this.passChange.old = "";
        this.notification.success("Password changed!", "Your password was updated.");
      },
      error => {
        this.changingPassword = false;
        this.notification.error("Error", error.json().errors.full_messages[0]);
      }
    );

  }

  ngOnInit() {

    this.titleService.setTitle("MO Plugins | Account");

    this.userService.getUserMe().subscribe(
      data => {
        this.user = data.json();
      }
    );

    //this.user = this.tokenAuthService.currentAuthData;

    this.userService.getUserPlugins().subscribe(
      data => {
        this.myPlugins = data.json();
      }
    );
  }

}
