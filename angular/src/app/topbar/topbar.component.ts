import { Component, OnInit } from "@angular/core";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";
import { LocalStorageService } from "../local-storage.service";
import { EventEmitterService } from "../event-emitter.service";
import { UserDataService } from "../user-data.service";
import { ApiService } from "../api.service";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.css"]
})
export class TopbarComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router,
    private storage: LocalStorageService,
    private events: EventEmitterService,
    private centralUserData: UserDataService,
    private api: ApiService
  ) {}

  ngOnInit() {
    // let token = this.storage.getToken();

    this.usersName = this.storage.getParsedToken().name;
    this.usersId = this.storage.getParsedToken()._id;
    this.events.onAlertEvent.subscribe(msg => {
      this.numOfFriendRequests--;
    });

    this.events.updateNumOfFriendRequestsEvent.subscribe(msg => {
      this.alertMessage = msg;
    });

    this.centralUserData.getUserData.subscribe(data => {
      this.userData = data;
      this.numOfFriendRequests = data.friend_requests.length;
      this.profilePicture = data.profile_image;
      console.log(this.profilePicture);
    });

    let requestObject = {
      location: `users/get-user-data/${this.usersId}`,
      type: "GET",
      authorize: true
    };

    this.api.makeRequest(requestObject).then(val => {
      console.log(val);
      this.centralUserData.getUserData.emit(val.user);
    });
  }

  private query: String = "";
  public usersName: string = "";
  public alertMessage: string = "";
  public usersId: string = "";
  public profilePicture: string = "default-avatar";

  public userData: object = {};
  public numOfFriendRequests: number = 0;

  public searchForFriends() {
    console.log("AMIT");
    this.router.navigate(["/search-results", { query: this.query }]);
  }
}
