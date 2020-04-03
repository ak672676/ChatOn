import { Component, OnInit } from "@angular/core";
import { ApiService } from "../api.service";
import { LocalStorageService } from "../local-storage.service";
import { Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
@Component({
  selector: "app-page-register",
  templateUrl: "./page-register.component.html",
  styleUrls: ["./page-register.component.css"]
})
export class PageRegisterComponent implements OnInit {
  constructor(
    private api: ApiService,
    private storage: LocalStorageService,
    private router: Router,
    private title: Title
  ) {}

  public formError = "";

  public credentials = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: ""
  };

  ngOnInit() {
    this.title.setTitle("ChatOn - Register");
  }

  public formSubmit() {
    this.formError = "";
    if (
      !this.credentials.first_name ||
      !this.credentials.last_name ||
      !this.credentials.email ||
      !this.credentials.password ||
      !this.credentials.password_confirm
    ) {
      return (this.formError = "All fields are required");
    }
    // var re = new RegExp(
    //   /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    // );
    // if (!re.test(this.credentials.email)) {
    //   return (this.formError = "Please Enter a valid Email Address");
    // }

    if (this.credentials.password !== this.credentials.password_confirm) {
      return (this.formError = "Password doesn't match.");
    }
    console.log("Form Submit");
    console.log(this.credentials);
    this.register();
  }

  private register() {
    let requestObject = {
      type: "POST",
      location: "users/register",
      body: this.credentials
    };
    this.api.makeRequest(requestObject).then(val => {
      if (val.token) {
        this.storage.setToken(val.token);
        this.router.navigate(["/"]);
        return;
      }
      if (val.message) {
        this.formError = val.message;
      }
      console.log(val);
    });
    console.log("Register");
  }
}
