import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalStorageService } from "./local-storage.service";
import { EventEmitterService } from "./event-emitter.service";
import { resolve } from "url";
@Injectable({
  providedIn: "root"
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private storage: LocalStorageService,
    private events: EventEmitterService
  ) {}

  private baseUrl = "http://localhost:3000";
  private successHandler(value) {
    return value;
  }

  private errorHandler(value) {
    return value;
  }

  public makeRequest(requestObject): any {
    let type = requestObject.type.toLowerCase();
    if (!type) {
      return console.log("No type specified in the request object");
    }
    let body = requestObject.body || {};
    let location = requestObject.location;
    if (!location) {
      return console.log("No location specified in the request");
    }

    let url = `${this.baseUrl}/${location}`;

    let httpOptions = {};

    if (requestObject.authorize) {
      console.log("API");
      httpOptions = {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.storage.getToken()}`
        })
      };
    }

    if (type === "get") {
      return this.http
        .get(url, httpOptions)
        .toPromise()
        .then(this.successHandler)
        .catch(this.errorHandler);
    }

    if (type === "post") {
      return this.http
        .post(url, body, httpOptions)
        .toPromise()
        .then(this.successHandler)
        .catch(this.errorHandler);
    }
    console.log(
      "Could not make the request.Make sure a type of GET or POST is supplied"
    );
  }

  public makeFriendRequest(to: String) {
    let from = this.storage.getParsedToken()._id;

    let requestObject = {
      location: `users/make-friend-request/${from}/${to}`,
      type: "POST",
      authorize: true
    };
    this.makeRequest(requestObject).then(val => {
      console.log(val);
      if (val.statusCode === 201) {
        this.events.onAlertEvent.emit("Successfully send a friend request.");
      } else {
        this.events.onAlertEvent.emit(
          "Something went wrong and we could not send a friend request.May be you would alraedy send a request."
        );
      }
    });
  }

  public resolveFriendRequest(resolution, id) {
    let to = this.storage.getParsedToken()._id;
    return new Promise((resolve, reject) => {
      let requestObject = {
        location: `users/resolve-friend-request/${id}/${to}?resolution=${resolution}`,
        type: "POST",
        authorize: true
      };
      this.makeRequest(requestObject).then(val => {
        if (val.statusCode === 201) {
          this.events.updateNumOfFriendRequestsEvent.emit();
          let resolutioned = resolution == "accept" ? "accepted" : "declined";
          this.events.onAlertEvent.emit(
            `Successfully ${resolutioned} friend request.`
          );
        } else {
          this.events.onAlertEvent.emit(
            "Something went wrong and we could not handle your friend request"
          );
        }
        resolve(val);
      });
    });
  }
}
