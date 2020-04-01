import { Component, OnInit } from "@angular/core";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";
import { LocalStorageService } from "../local-storage.service";
@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.css"]
})
export class TopbarComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router,
    private storage: LocalStorageService
  ) {}

  ngOnInit() {
    // let token = this.storage.getToken();

    this.usersName = this.storage.getParsedToken().name;
  }

  private query: String = "";
  public usersName: string = "Tom";

  public searchForFriends() {
    console.log("AMIT");
    this.router.navigate(["/search-results", { query: this.query }]);
  }
}
